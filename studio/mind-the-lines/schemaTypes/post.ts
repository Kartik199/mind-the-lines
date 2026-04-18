import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'post',
    title: 'Editorial Post',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: { source: 'title' },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'publishedAt',
            title: 'Original Published Date',
            type: 'datetime',
            description: 'Set this to control the date shown in the grid. If empty, creation date is used.',
            options: {
                dateFormat: 'YYYY-MM-DD',
                timeFormat: 'HH:mm',
            }
        }),
        defineField({
            name: 'summary',
            title: 'Home Page Summary',
            description: 'The short hook that appears on the homepage cards.',
            type: 'text',
            rows: 3,
            validation: (Rule) => Rule.required().max(200),
        }),
        defineField({
            name: 'categories',
            title: 'Categories',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'category' }] }],
        }),
        defineField({
            name: 'heroImage',
            title: 'Hero Image',
            type: 'image',
            options: { hotspot: true },
            fields: [
                {
                    name: 'alt',
                    type: 'string',
                    title: 'Alt Text',
                },
            ],
        }),
        defineField({
            name: 'body',
            title: 'Content Body',
            type: 'array',
            of: [
                { type: 'block' },
                {
                    type: 'image',
                    options: { hotspot: true },
                    fields: [
                        { name: 'caption', type: 'string', title: 'Caption' },
                        { name: 'alt', type: 'string', title: 'Alt Text' },
                    ],
                },
                {
                    type: 'object',
                    name: 'youtube',
                    title: 'YouTube Video',
                    fields: [{ name: 'url', type: 'url', title: 'Video URL' }],
                },
                {
                    name: 'inlineQuote',
                    type: 'object',
                    fields: [
                        { name: 'text', type: 'text' },
                        { name: 'author', type: 'string' },
                        {
                            name: 'style',
                            type: 'string',
                            options: { list: ['editorial', 'pull-left', 'pull-right'] }
                        }
                    ]
                }
            ],
        }),
    ],
})