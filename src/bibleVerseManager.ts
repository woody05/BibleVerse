import Joplin from "api/Joplin";
import { findBookId } from "./bibleIdLookup";
import { BibleApiProxy } from './Proxies/bibleApiProxy';

export class BibleVerseManager {
    joplin: Joplin;
    isUpdatingVerses: boolean = false;
    bibleApiProxy: BibleApiProxy = new BibleApiProxy();
    bibleId: string = '';
    bibleVerses: any[] = [];

    constructor(joplin: Joplin) {
        this.joplin = joplin;
    }

    async initialize() : Promise<void> {
        await this.bibleApiProxy.initialize();
    }

    async getBibleVersesFromNote() : Promise<any[]> {
        const note = await this.joplin.workspace.selectedNote();
        const rawBibleVerses = note.body.match(/(?:\b(?:[1-3]?\s?[A-Za-z]+\.?\s?\d{1,3}:\d{1,3}(?:-\d{1,3})?))/g) || [];
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
        return result;
    }

    async updateSavedVerses() : Promise<void> {

        if (this.isUpdatingVerses) {
            return;
        }

        const note = await this.joplin.workspace.selectedNote();

        if (!note) {
            this.isUpdatingVerses = false;
            return;
        }

        this.isUpdatingVerses = true; // LOCK

        // Extract verses from the current note
        const versesFromNote = await this.getBibleVersesFromNote();
        const cached = this.bibleVerses

        let allVerses = await this.mergeVerses(versesFromNote, cached);
        let allVersesWithText = await this.getVersesWithText(allVerses);

        this.saveVersesToCache(cached, allVersesWithText);
    }

    async mergeVerses(versesFromNote: any[], savedVerses: any[]) : Promise<any[]> {
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

    async getVersesWithText(verses: any[]) : Promise<any[]> {
        let versesWithText = verses;
        const bibleId = await this.joplin.settings.value('bibleVersion');
        try {
            versesWithText = await Promise.all(verses.map(async (verse) => {

                // Only fetch if verse text is missing or invalid
                if (!verse.text || verse.text.startsWith('Could not parse') || verse.text.startsWith('Error fetching')) {
                    console.log('Fetching verses...');
                    verse.version = (await this.bibleApiProxy.getBibleVersionAsync(bibleId)).abbreviation;
                    verse.text = await this.bibleApiProxy.getPassageAsync(
                        bibleId,
                        `${verse.bookId}.${verse.chapter}.${verse.startVerse}-${verse.bookId}.${verse.chapter}.${verse.endVerse || verse.startVerse}`
                    );
                }

                return verse;
            }));

            return verses;
        }
        catch (e) {
            console.error('Error processing verses:', e);
        }
    }

    async areVersesUnchanged<T>(oldVerses: T[], newVerses: T[]): Promise<boolean> {
        if (oldVerses.length !== newVerses.length) return false;

        return oldVerses.every((item, i) =>
            JSON.stringify(item) === JSON.stringify(newVerses[i])
        );
    }

    async saveVersesToCache(savedVerses: any[], allVersesWithText: any[]) : Promise<void> {
        try {

            if (await this.areVersesUnchanged(savedVerses, allVersesWithText)) {
                return;
            }

            this.bibleVerses = allVersesWithText;
        }
        catch (e) {
            console.error('Error saving verses to note metadata:', e);
        }
        finally {
            this.isUpdatingVerses = false; // UNLOCK
        }
    }

    async clearVersesCache() : Promise<void> {
        this.bibleVerses = [];
    }
}