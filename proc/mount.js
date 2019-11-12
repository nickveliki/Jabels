const props = JSON.parse(process.env.props);
const result = require(props.path)[props.funcname](props.args);
process.stdout.write(result?typeof(result)==="string"?result:JSON.stringify(result):"null");