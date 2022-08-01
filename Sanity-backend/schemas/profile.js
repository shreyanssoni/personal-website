export default {
    name: 'profile',
    type: 'document',
    title: 'Profile',
    fields: [
        {
            name: 'title',
            type: 'string',
            title: 'Title'
        },
        {
            name: 'name',
            type: 'string',
            title: 'Name'
        },
        {
            name: 'image',
            type: 'image',
            title: 'Image'
        },
        {
            name: "link",
            type: "string",
            title: "Resume Link"
        },
        {
            name: 'projects',
            type: 'string',
            title: 'Projects Link'
        },
        {
            name: 'about',
            title: 'About',
            type: 'array',
            of: [
              {
                type: 'block'
              },
              {
                type: 'image',
                fields: [
                  {
                    type: 'text',
                    name: 'alt',
                    title: 'Alternative text',
                    description: `Some of your visitors cannot see images, 
                      be they blind, color-blind, low-sighted; 
                      alternative text is of great help for those 
                      people that can rely on it to have a good idea of 
                      what\'s on your page.`,
                    options: {
                      isHighlighted: true
                    }
                  }
                ]
              }
            ]
        }
    ]
}