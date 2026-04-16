import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'post',
    title: 'Editorial Post',
    type: 'document',
    fields: [
        /* 1. Meta & Discovery */
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
            name: 'summary',
            title: 'Home Page Summary',
            description: 'The short hook that appears on the homepage cards. Keep it under 160 characters.',
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

        /* 2. Visuals */
        defineField({
            name: 'heroImage',
            title: 'Hero Image',
            description: 'The full-bleed image at the top of the article.',
            type: 'image',
            options: { hotspot: true },
            fields: [
                {
                    name: 'alt',
                    type: 'string',
                    title: 'Alt Text',
                    description: 'Important for SEO and accessibility.',
                },
            ],
        }),

        /* 3. The Rich Text Body (WordPress Migration Ready) */
        defineField({
            name: 'body',
            title: 'Content Body',
            description: 'The main prose. Use blocks for inline images and YouTube embeds.',
            type: 'array',
            of: [
                { type: 'block' }, // Standard text
                {
                    type: 'image',
                    title: 'Inline Photo',
                    options: { hotspot: true },
                    fields: [
                        {
                            name: 'caption',
                            type: 'string',
                            title: 'Caption',
                            description: 'Appears below the image.',
                        },
                        {
                            name: 'alt',
                            type: 'string',
                            title: 'Alt Text',
                        },
                    ],
                },
                {
                    type: 'object',
                    name: 'youtube',
                    title: 'YouTube Video',
                    fields: [
                        {
                            name: 'url',
                            type: 'url',
                            title: 'Video URL',
                        },
                    ],
                },
                {
                    type: 'object',
                    name: 'inlineQuote',
                    title: 'Inline Quote',
                    fields: [
                        { name: 'text', type: 'text', title: 'The Quote' },
                        { name: 'author', type: 'string', title: 'Source (e.g. Baashha)' }
                    ]
                }
            ],
        }),
    ],
})