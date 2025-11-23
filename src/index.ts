import joplin from 'api';
import { ToolbarButtonLocation } from 'api/types';
import { BiblePanelManager } from './biblePanelManager';
import { BibleVerseManager } from "./bibleVerseManager";
import { Settings } from "./settings";
import Logger, { LogLevel, TargetType } from '@joplin/utils/Logger';

setupLogging();

const logger = Logger.create('BibleVerse: Index');

joplin.plugins.register({
    onStart: async function () {

        logger.info('Bible Verse Plugin Started');

        const settings = new Settings(joplin);
        const bibleVerseManager = new BibleVerseManager(joplin);
        const biblePanelManager = new BiblePanelManager(joplin, bibleVerseManager);

        await settings.initialize();
        await bibleVerseManager.initialize();
        await biblePanelManager.initialize();

        logger.info('Bible Verse Dependency Initialization Complete');

        // Register the command for both desktop and mobile
        await joplin.commands.register({
            name: 'toggleBibleVerse',
            label: 'Toggle Bible Verse',
            iconName: 'fas fa-bible',
            execute: async () => {
                await biblePanelManager.togglePanel();
            }
        });

        // Ensure updatePanel runs once at startup and avoid immediate duplicate events
        let suppressNoteEvents = true;

        try {
            // Register handlers but ignore events until we've done the initial update
            await joplin.workspace.onNoteChange(async () => {
                if (suppressNoteEvents) return;
                await biblePanelManager.updatePanel();
            });

            await joplin.workspace.onNoteSelectionChange(async () => {
                if (suppressNoteEvents) return;
                bibleVerseManager.clearVersesCache();
                await biblePanelManager.updatePanel();
            });

            await joplin.views.toolbarButtons.create(
                'bibleVerseToolbarButton',
                'toggleBibleVerse',
                ToolbarButtonLocation.NoteToolbar
            );
        } catch (e) {
            logger.warn('Could not register note change or selection change events. This may be due to running on a mobile platform.');
            console.log('Mobile platform detected: Panels and toolbar buttons are not supported.');
        }

        // Perform a single initial update and then allow event-driven updates
        try {
            await biblePanelManager.updatePanel();
        } catch (e) {
            logger.warn('Initial panel update failed:', e);
            console.error('Initial panel update failed:', e);
        } finally {
            suppressNoteEvents = false;
        }
    }

});

function getJoplinLogDir() {

    try {
        const os = require('os');
        const path = require('path');
        const home = os.homedir();
        const platform = process.platform;

        switch (platform) {
            case "win32":
                return path.join(home, ".config", "joplin-desktop");

            case "darwin": // macOS desktop
                return path.join(home, "Library", "Application Support", "joplin-desktop");

            case "linux": // Linux desktop
            default:
                // Normal Linux
                return path.join(home, ".config", "joplin-desktop");
        }
    }
    catch (e) {
        console.error('Could not determine Joplin log directory:', e);
        return null;
    }
}

function setupLogging() {
    const globalLogger = new Logger();
    const path = require('path');
    let fsPromises: any = null;
    try {
        const req = eval('require'); // runtime require - avoids bundler static analysis
        fsPromises = req('fs/promises');

        Logger.fsDriver_ = {
            appendFile: async (p: string, content: any, encoding?: any) => {
                return await fsPromises.appendFile(p, content, encoding);
            },
        };

        const logDirectory = getJoplinLogDir();

        // If we couldn't determine a log directory, fall back to console logging
        if (logDirectory === null) {
            globalLogger.addTarget(TargetType.Console, {
                level: LogLevel.Info,
            });
            return;
        }

        const logPath = path.join(logDirectory, 'bible_verse_log.txt');

        globalLogger.addTarget(TargetType.File, {
            prefix: 'testing',
            path: logPath,
            level: LogLevel.Debug,
        });

    } catch (err) {
        // Fallback to console-only logging if fs/promises couldn't be loaded
        globalLogger.addTarget(TargetType.Console, {
            level: LogLevel.Info,
        });
        // If requiring fails, fall back to console logging
        console.warn('Could not load fs/promises at runtime, falling back to console logger.', err);
    }

    Logger.initializeGlobalLogger(globalLogger);
}