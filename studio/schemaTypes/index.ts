import {category} from './documents/category'
import {concept} from './documents/concept'
import {docsHomepage} from './documents/docsHomepage'
import {guide} from './documents/guide'
import {journey} from './documents/journey'
import {releaseNote} from './documents/releaseNote'
import {articleSection} from './objects/articleSection'
import {callout} from './objects/callout'
import {codeBlock} from './objects/codeBlock'
import {diagram} from './objects/diagram'
import {figure} from './objects/figure'
import {glossaryTerm} from './objects/glossaryTerm'
import {guideStep} from './objects/guideStep'
import {discoveryCard, popularTopic} from './objects/homepageBlocks'
import {journeyStage} from './objects/journeyStage'
import {richText} from './objects/richText'
import {table} from './objects/table'
import {troubleshootingItem} from './objects/troubleshootingItem'

export const schemaTypes = [
  // Documents
  docsHomepage,
  concept,
  guide,
  journey,
  releaseNote,
  category,
  // Objects
  richText,
  callout,
  codeBlock,
  figure,
  table,
  diagram,
  articleSection,
  glossaryTerm,
  guideStep,
  troubleshootingItem,
  journeyStage,
  discoveryCard,
  popularTopic,
]
