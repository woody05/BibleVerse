import joplin from 'api';
import { PassagesApi, Configuration, GetPassageRequest, BiblesApi, Bible } from '../bibleApiService';

export class BibleApiProxy {
    configuration: Configuration;
    passagesClient: PassagesApi;
    biblesClient: BiblesApi;

    constructor() {
        // Properties are set here
    }

    async initialize() : Promise<void> {;
        try{
            await joplin.settings.value('apiKey');
        }
        catch(e){
            console.error('Error fetching API key from settings:', e);
        }
        this.configuration = new Configuration({
            apiKey: await joplin.settings.value('apiKey'),
        });

        // Initialize the PassagesApi client
        this.passagesClient = new PassagesApi(this.configuration);
        this.biblesClient = new BiblesApi(this.configuration);
    }

    async getPassageAsync(bibleId: string, passageId: string): Promise<string> {
        try {
            const { data } = await this.passagesClient.getPassage(
                {
                    bibleId: bibleId,
                    passageId: passageId,
                    textType: 'text',
                } as GetPassageRequest // Type assertion to satisfy TypeScript
                // bibleId,        // The ID of the Bible (e.g., '06125adad2d5898a-01')
                // passageId,      // The passage reference (e.g., 'John.3.16')
                // 'text'        // Content type: 'html', 'json', or 'text'
                // false,          // Include footnotes (optional)
                // true,           // Include section titles (optional)
                // false,          // Include chapter numbers (optional)
                // true,           // Include verse numbers (optional)
                // false,          // Include verse spans (optional)
                // undefined,      // Parallels (optional)
                // false           // Use organization ID (optional)
            );

            return data.content; // Return the passage content
        } catch (error) {
            console.error('Error fetching passage:', error);
            return 'Error fetching passage.';
        }
    }

    async getBibleVersionAsync(bibleId: string): Promise<Bible> {
        var response = await this.biblesClient.getBible({
            bibleId: bibleId
        } as GetPassageRequest);

        return response.data;
    }
}