import { BibleVerseManager } from "./bibleVerseManager";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBookOpen, faSearch } from '@fortawesome/free-solid-svg-icons';
import Joplin from "api/Joplin";

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

    async initialize() : Promise<void> {
        this.bibleVersePanel = await this.joplin.views.panels.create("bibleVersePanel");

        // CSS & JS
        await this.joplin.views.panels.addScript(this.bibleVersePanel, "style.css");
        await this.joplin.views.panels.addScript(this.bibleVersePanel, "bibleVersePanelScripts.js");
        await this.joplin.views.panels.show(this.bibleVersePanel);
    }

    async updatePanel() : Promise<void>{

        if(this.updating){
            console.log('Already updating...')
            return;
        }

        if (!this.bibleVersePanel) return;

        this.updating = true;

        const note = await this.joplin.workspace.selectedNote();
        if (!note) {
            this.updating = false;
            return;
        }

        const verses = this.bibleVerseManager.bibleVerses;

        if (!verses || verses.length === 0) {
            await this.joplin.views.panels.setHtml(
                this.bibleVersePanel,
                this.getPanelLoadingHtml()
            );
        }

        await this.bibleVerseManager.updateSavedVerses();
        const bibleVerses = this.bibleVerseManager.bibleVerses;

        await this.joplin.views.panels.setHtml(
            this.bibleVersePanel,
            this.getPanelHtml(bibleVerses)
        );

        this.updating = false;
    }

    async togglePanel() : Promise<void> {
        const visible = await this.joplin.views.panels.visible(this.bibleVersePanel);
        if (visible) {
            await this.joplin.views.panels.hide(this.bibleVersePanel);
        } else {
            await this.joplin.views.panels.show(this.bibleVersePanel);
        }
    }

    getPanelHtml(bibleVerses: any[]) : string {
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

    getPanelLoadingHtml() : string {
        return `
        <div class="bible-verse-panel" style="padding:1em;">
            <h2><i class="fas fa-book-open"></i> Bible Verses</h2>
            <h4>Loading Verses...</h4>
        </div>
    `;
    }
}
