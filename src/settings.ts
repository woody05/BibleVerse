import { SettingItemType } from 'api/types';

export class Settings{
    joplin: any

    constructor(joplin: any){
        this.joplin = joplin;
    }

    async initialize(){
        await this.joplin.settings.registerSection('BibleVersePluginSection', {
            label: 'Bible Verse Settings',
            iconName: 'fas fa-bible', // any FontAwesome 5 icon
        });

        await this.joplin.settings.registerSettings({
            apiKey: {
                value: '',
                type: SettingItemType.String,
                section: 'BibleVersePluginSection',
                public: true, // must be true for it to appear in the UI
                label: 'API Key',
                description: 'Please enter your API key here. Please visit https://scripture.api.bible/ to obtain an API key.',
            },
            bibleVersion: {
                value: '06125adad2d5898a-01',
                type: SettingItemType.String,
                section: 'BibleVersePluginSection',
                public: true, // must be true for it to appear in the UI
                label: 'Bible Version Id',
                description: 'The Id to be used for Bible verses (default is "06125adad2d5898a-01" for ASV).\nYou can find other version Ids at https://docs.api.bible/guides/bibles',
            }
        });
    }
}