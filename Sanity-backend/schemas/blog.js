export default {
    name: 'blog',
    type: 'document',
    title: 'Blog',
    fields: [
        {
            name: 'title',
            type: 'string',
            title: 'Title'
        },
        {
          title: 'Slug',
          name: 'slug',
          type: 'slug',
          options: {
            source: 'title',
            maxLength: 200, // will be ignored if slugify is set
            slugify: input => input
                                 .toLowerCase()
                                 .replace(/\s+/g, '-')
                                 .slice(0, 200)
          }
        },
        // {
        //   name: "Content",
        //   type: "markdown",
        //   title: "Content"
        // },
        {
            name: 'content',
            title: 'Content',
            type: 'array',
            of: [
              {
                type: 'block',
                // marks: {
                //   decorators: [
                //     { title: 'Strong', value: 'strong' },
                //     { title: 'Emphasis', value: 'em' },
                //     { title: 'Code', value: 'code' },
                //     { title: 'Highlight', value: 'highlight' }
                //   ]
                // },
                // styles: [
                //   {title: 'Normal', value: 'normal'},
                //   {title: 'Title', value: 'title'},
                //   {title: 'H1', value: 'h1'},
                //   {title: 'H2', value: 'h2'},
                //   {title: 'H3', value: 'h3'},
                //   {title: 'Quote', value: 'blockquote'},
                // ]
              },
              {
                type: 'image',
                fields: [
                  {
                    type: 'text',
                    name: 'alt',
                    title: 'Alternative text',
                    options: {
                      isHighlighted: true
                    }
                  }
                ]
              }
            ]
          },
          {
            name: 'metadesc',
            type: 'string',
            title: 'Meta Description'
        },
          {
            title: 'Blog Image',
            name: 'blogimage',
            type: 'image',
            options: {
              hotspot: true // <-- Defaults to false
            },
            fields: [
              {
                name: 'caption',
                type: 'string',
                title: 'Caption',
                options: {
                  isHighlighted: true // <-- make this field easily accessible
                }
              },
              {
                // Editing this field will be hidden behind an "Edit"-button
                name: 'attribution',
                type: 'string',
                title: 'Attribution',
              }
            ]
          },
        {
            title: 'Created At',
            name: 'createdAt',
            type: 'datetime', 
        },
        {
            name: 'author',
            type: 'object',
            fields: [
              {
                title: 'Author',
                name: 'author',
                type: 'reference',
                to: [{type: 'author'}]
              }
            ]
          },
          {
            name: 'tags',
            title: 'Tags',
            type: 'tags',
          }
    ]
}