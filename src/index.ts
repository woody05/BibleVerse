import joplin from 'api';
import { ToolbarButtonLocation } from 'api/types';
import { BiblePanelManager } from './biblePanelManager';
import { BibleVerseManager } from "./bibleVerseManager";
import { Settings } from "./settings";

joplin.plugins.register({
    onStart: async function () {

        const settings = new Settings(joplin);
        const bibleVerseManager = new BibleVerseManager(joplin);
        const biblePanelManager = new BiblePanelManager(joplin, bibleVerseManager);
        
        await settings.initialize();
        await bibleVerseManager.initialize();
        await biblePanelManager.initialize();

        // Register the command for both desktop and mobile
        await joplin.commands.register({
            name: 'toggleBibleVerse',
            label: 'Toggle Bible Verse',
            iconName: 'fas fa-bible',
            execute: async () => {
                await biblePanelManager.togglePanel();
            }
        });

        try {
            await joplin.workspace.onNoteChange(() => biblePanelManager.updatePanel());
            await joplin.workspace.onNoteSelectionChange(() => {
                bibleVerseManager.clearVersesCache()
                biblePanelManager.updatePanel()
            });

            await joplin.views.toolbarButtons.create(
                'bibleVerseToolbarButton',
                'toggleBibleVerse',
                ToolbarButtonLocation.NoteToolbar
            );
        } catch (e) {
            console.log('Mobile platform detected: Panels and toolbar buttons are not supported.');
        }
    }
    
});