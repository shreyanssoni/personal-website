// First, we must import the schema creator
import createSchema from 'part:@sanity/base/schema-creator'
import blog from './blog'
import author from './author'
import profile from './profile'


// Then import schema types from any plugins that might expose them
import schemaTypes from 'all:part:@sanity/base/schema-type'
import subscribers from './Subscribers'
import form from './form'
import projects from './projects'
// import _break from './break'

// Then we give our schema to the builder and provide the result to Sanity
export default createSchema({
  // We name our schema
  name: 'default',
  // Then proceed to concatenate our document type
  // to the ones provided by any plugins that are installed
  types: schemaTypes.concat([
    /* Your types here! */
    blog, author, profile, subscribers, form, projects
  ]),
})