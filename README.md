# Jabels
Ja JSON-based relational single-index database with twig property retrieval

main.js really just shows my test for the system, the package that does the heavy lifting is fetchData.js

the exported functions:

definitions(definition, strict) allows you to display and filter the master database list. Strict mode picks an entry that exactly matches the relative path of your target library (relative to the folder of ../db), non-strict mode checks if the path is included in any of the library entries, or if the path includes any library entries (to do: come up with a better filter function)

getDefinition(definition) is just the first function, purely in strict mode, and returns the content of the definitions file as a string

writeDefinition(definition) creates new definition files and version entries based on context. The definition must have at least 3 properties: path, indexKey, and [indexKey]. Path refers to where the file is saved, indexKey denotes the critical search key for the definition library, and [indexkey] is the value that is used to determine if an existing version will be updated or a new version will be appended. If the master definitions list doesn't contain the path, a new path entry will be appended, and a new definition file will be written.

getDefinitionProperties(definition) gets the properties of the specific version associated with the definition[indexKey]

getDefinitionProperty(definition, property) gets one specific property associated with the definition[indexKey]

getTwig(definition, branch) gets a property at an arbitrary depth, so long as the property path is provided. All elements of the property chain must be provided to render a property, e.g. foo.0.bar will render bar of 0 of foo in the version of definition associated with definition[indexKey]

