import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';
import { structure } from './deskStructure';

export default defineConfig({
  name: 'default',
  title: 'WLS Lighting CMS',

  projectId: 'f7nom1u6',
  dataset: 'production',

  plugins: [deskTool({ structure }), visionTool()],

  schema: {
    types: schemaTypes,
  },
});
