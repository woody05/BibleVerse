import { BibleVerseManager } from "./bibleVerseManager";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBookOpen, faSearch } from '@fortawesome/free-solid-svg-icons';
import Logger from "@joplin/utils/Logger";
import Joplin from "api/Joplin";

const logger = Logger.create('BibleVerse: BiblePanelManager');

export class BiblePanelManager {
    joplin: Joplin;
    bibleVerseManager: BibleVerseManager;
    bibleVersePanel: string;
    updating: boolean

    constructor(joplin: Joplin, bibleVerseManager: BibleVerseManager) {
        this.joplin = joplin;
        this.bibleVerseManager = bibleVerseManager;

        library.add(faBookOpen, faSearch);
    }

    async initialize(): Promise<void> {
        logger.info('Initializing BiblePanelManager...');
        this.bibleVersePanel = await this.joplin.views.panels.create("bibleVersePanel");

        // CSS & JS
        await this.joplin.views.panels.addScript(this.bibleVersePanel, "style.css");
        await this.joplin.views.panels.addScript(this.bibleVersePanel, "bibleVersePanelScripts.js");
        await this.joplin.views.panels.show(this.bibleVersePanel);

        logger.info('BiblePanelManager Initialized...');
    }

    async updatePanel(): Promise<void> {

        if (this.updating) {
            console.log('Already updating...')
            logger.warn('Already updating panel, skipping...');
            return;
        }

        if (!this.bibleVersePanel) {
            logger.warn('Bible Verse Panel not initialized, skipping panel update...');
            return
        };

        this.updating = true;

        const note = await this.joplin.workspace.selectedNote();
        if (!note) {
            this.updating = false;
            logger.warn('No note selected, skipping panel update...');
            return;
        }

        const verses = this.bibleVerseManager.bibleVerses;

        if (!verses || verses.length === 0) {
            try {
                logger.info('No verses found, setting loading HTML...');
                await this.joplin.views.panels.setHtml(
                    this.bibleVersePanel,
                    this.getPanelLoadingHtml()
                );
            }
            catch (e) {
                logger.error('Error setting panel loading HTML:', e);
                console.error('Error setting panel loading HTML:', e);
            }
        }

        await this.bibleVerseManager.updateSavedVerses();
        const bibleVerses = this.bibleVerseManager.bibleVerses;

        try {
            logger.info('Updating panel HTML with verses...');
            await this.joplin.views.panels.setHtml(
                this.bibleVersePanel,
                this.getPanelHtml(bibleVerses)
            );
        }
        catch (e) {
            logger.error('Error updating panel HTML:', e);
            console.error('Error updating panel HTML:', e);
        }

        this.updating = false;
    }

    async togglePanel(): Promise<void> {
        const visible = await this.joplin.views.panels.visible(this.bibleVersePanel);
        if (visible) {
            await this.joplin.views.panels.hide(this.bibleVersePanel);
        } else {
            await this.joplin.views.panels.show(this.bibleVersePanel);
        }
    }

    getPanelHtml(bibleVerses: any[]): string {
        return `
        <div class="bible-verse-panel" style="padding:1em;">
            <h2><i class="fas fa-book-open"></i> Bible Verses</h2>

            <div class="input-group" style="margin-bottom:1em;">
                <i class="fas fa-search" style="color: #fff; margin-right: 1em;"></i>
                <input
                    type="search"
                    id="bibleVerseSearch"
                    class="input"
                    placeholder="Search Bible Verses..."
                    style="flex:1;"
                />
            </div>

            <div class="verses-container">
                ${bibleVerses.length
                ? bibleVerses
                    .map(
                        v => `
                            <div class="card verse-card">
                                <div class="card-title">
                                    <strong>(${v.version || "Unknown"}) ${v.book} ${v.chapter}:${v.startVerse}${v.endVerse && v.endVerse !== v.startVerse
                                ? "-" + v.endVerse
                                : ""
                            }</strong>
                                </div>
                                <div class="card-body">
                                    <p>${v.text.replace("\\", "")}</p>
                                </div>
                            </div>`
                    )
                    .join("")
                : '<div class="text-muted">No Bible verses found in this note.</div>'
            }
            </div>
        </div>
        `;
    }

    getPanelLoadingHtml(): string {
        return `
        <div class="bible-verse-panel" style="padding:1em;">
            <h2><i class="fas fa-book-open"></i> Bible Verses</h2>
            <h4>Loading Verses...</h4>
        </div>
    `;
    }
}
