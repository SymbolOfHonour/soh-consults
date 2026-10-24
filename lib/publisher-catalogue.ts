import {cache} from 'react';
import {listPublishedStories} from './news-queue';
import {listPublicWriterProfiles} from './public-writer-profile';
import {buildPublisherCatalogue} from './publisher-profiles';

// Request-scoped memoization shares the same live data between metadata and page.
export const getPublisherCatalogue=cache(async()=>{
 const [stories,profiles]=await Promise.all([listPublishedStories({strict:true}),listPublicWriterProfiles()]);
 return buildPublisherCatalogue(stories,profiles);
});
