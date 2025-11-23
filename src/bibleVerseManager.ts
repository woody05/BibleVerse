import Joplin from "api/Joplin";
import { findBookId } from "./bibleIdLookup";
import { BibleApiProxy } from './Proxies/bibleApiProxy';
import Logger from "@joplin/utils/Logger";
import { log } from "console";
import { on } from "events";

const logger = Logger.create('BibleVerse: BibleVerseManager');

export class BibleVerseManager {
    joplin: Joplin;
    isUpdatingVerses: boolean = false;
    bibleApiProxy: BibleApiProxy = new BibleApiProxy();
    bibleId: string = '';
    bibleVerses: any[] = [];

    constructor(joplin: Joplin) {
        this.joplin = joplin;
    }

    async initialize(): Promise<void> {
        logger.info('Initializing BibleVerseManager...');
        await this.bibleApiProxy.initialize();
        logger.info('BibleVerseManager Initialized...');
    }

    async getBibleVersesFromNote(): Promise<any[]> {
        const note = await this.joplin.workspace.selectedNote();
        const rawBibleVerses = note.body.match(/(?:\b(?:[1-3]?\s?[A-Za-z]+\.?\s?\d{1,3}:\d{1,3}(?:-\d{1,3})?))/g) || [];

        try {
            let result = rawBibleVerses.map((verse) => {
                const regex = /([1-3]?\s?[A-Za-z]+)\.?\s*(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?/;
                const match = verse.match(regex);
                if (!match) {
                    return { book: 'Unknown', chapter: '', startVerse: '', endVerse: '', text: `Could not parse: ${verse}` };
                }
                const [, bookName, chapter, startVerse, endVerse] = match;

                return {
                    bookId: findBookId(bookName),
                    book: bookName.trim(),
                    chapter: parseInt(chapter, 10),
                    startVerse: parseInt(startVerse, 10),
                    endVerse: endVerse ? parseInt(endVerse, 10) : parseInt(startVerse, 10),
                    text: ""
                };
            });

            logger.debug(`Extracted verses from note: ${JSON.stringify(result)}`);

            return result;
        }
        catch (e) {
            logger.error('Error extracting verses from note:', e);
            console.error('Error extracting verses from note:', e);
        }
    }

    async updateSavedVerses(): Promise<void> {

        if (this.isUpdatingVerses) {
            logger.warn('Update already in progress, skipping...');
            return;
        }

        const note = await this.joplin.workspace.selectedNote();

        if (!note) {
            this.isUpdatingVerses = false;
            logger.warn('No note selected, cannot update verses.');
            return;
        }

        this.isUpdatingVerses = true; // LOCK

        // Extract verses from the current note
        const versesFromNote = await this.getBibleVersesFromNote();

        if (versesFromNote.length <= 0) {
            this.isUpdatingVerses = false; // UNLOCK
            logger.info('No Bible verses found in the current note.');
            return;
        }

        const cached = this.bibleVerses

        let allVerses = await this.mergeVerses(versesFromNote, cached);
        let allVersesWithText = await this.getVersesWithText(allVerses);

        this.saveVersesToCache(cached, allVersesWithText);
    }

    async mergeVerses(versesFromNote: any[], savedVerses: any[]): Promise<any[]> {
        logger.info('Merging verses from note with saved verses...');
        try {
            // Filter out saved verses that are not in the current note
            const updatedSavedVerses = savedVerses.filter((savedVerse): any =>
                versesFromNote.some(noteVerse =>
                    savedVerse.bookId === noteVerse.bookId &&
                    savedVerse.book === noteVerse.book &&
                    savedVerse.chapter === noteVerse.chapter &&
                    savedVerse.startVerse === noteVerse.startVerse &&
                    savedVerse.endVerse === noteVerse.endVerse
                )
            );

            // Add new verses from the note to the saved verses
            return [
                ...updatedSavedVerses,
                ...versesFromNote.filter(noteVerse =>
                    !updatedSavedVerses.some(savedVerse =>
                        savedVerse.bookId === noteVerse.bookId &&
                        savedVerse.book === noteVerse.book &&
                        savedVerse.chapter === noteVerse.chapter &&
                        savedVerse.startVerse === noteVerse.startVerse &&
                        savedVerse.endVerse === noteVerse.endVerse
                    )
                ).map(noteVerse => ({
                    bookId: noteVerse.bookId,
                    book: noteVerse.book,
                    chapter: noteVerse.chapter,
                    startVerse: noteVerse.startVerse,
                    endVerse: noteVerse.endVerse,
                    text: null,// no text available in note
                    version: null
                }))
            ];
        }
        catch (e) {
            logger.error('Error merging verses:', e);
            console.error('Error merging verses:', e);
        }
    }

    async getVersesWithText(verses: any[]): Promise<any[]> {
        let versesWithText = verses;
        try {
            const bibleId = await this.joplin.settings.value('bibleVersion');
            versesWithText = await Promise.all(verses.map(async (verse) => {

                // Only fetch if verse text is missing or invalid
                if (!verse.text || verse.text.startsWith('Could not parse') || verse.text.startsWith('Error fetching')) {

                    logger.debug(`Fetching text for verse: ${JSON.stringify(verse)}`);

                    try {
                        verse.version = (await this.bibleApiProxy.getBibleVersionAsync(bibleId)).abbreviation;
                    } catch (e) {
                        logger.error('Error fetching Bible version abbreviation:', e);
                        verse.version = 'Unknown';
                    }

                    try{
                        verse.text = await this.bibleApiProxy.getPassageAsync(
                        bibleId,
                        `${verse.bookId}.${verse.chapter}.${verse.startVerse}-${verse.bookId}.${verse.chapter}.${verse.endVerse || verse.startVerse}`
                    );
                    }
                    catch (e) {
                        logger.error('Error fetching passage text:', e);
                        verse.text = `Error fetching text for ${verse.book} ${verse.chapter}:${verse.startVerse}${verse.endVerse && verse.endVerse !== verse.startVerse ? "-" + verse.endVerse : ""}`;
                    }
                }

                return verse;
            }));

            logger.debug(`Fetched verses with text: ${JSON.stringify(versesWithText)}`);
            return verses;
        }
        catch (e) {
            logger.error('Error fetching verses with text:', e);
            console.error('Error processing verses:', e);
        }
    }

    async areVersesUnchanged<T>(oldVerses: T[], newVerses: T[]): Promise<boolean> {
        if (oldVerses.length !== newVerses.length) return false;

        return oldVerses.every((item, i) =>
            JSON.stringify(item) === JSON.stringify(newVerses[i])
        );
    }

    async saveVersesToCache(savedVerses: any[], allVersesWithText: any[]): Promise<void> {
        try {

            if (await this.areVersesUnchanged(savedVerses, allVersesWithText)) {
                return;
            }

            this.bibleVerses = allVersesWithText;
        }
        catch (e) {
            logger.error('Error saving verses to cache:', e);
            console.error('Error saving verses to note metadata:', e);
        }
        finally {
            this.isUpdatingVerses = false; // UNLOCK
        }
    }

    async clearVersesCache(): Promise<void> {
        this.bibleVerses = [];
    }
}