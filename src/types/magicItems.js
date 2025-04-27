import dedent from 'dedent';
import _ from 'lodash';

const magicItemQuery = `query MagicItemQuery($index: String) {
  magicItem(index: $index) {
    name
    desc
    image
  }
}`;

const magicItemFormat = function(responseData) {

	const data = responseData.data.magicItem;
	if(responseData.data?.srdAttrib){ data.srdAttrib = responseData.data.srdAttrib};

	const magicItemDefaults = {
		name: 'Unnamed Magic Item',
		desc: [],
	};

	_.defaultsDeep(data, magicItemDefaults);

	const output = dedent`
	#### ${data.name}
	${data.desc.map((line, index)=>{ 
		if(index == 0) return `*${line}*\n\n:\n`;
		if(line.match(/\(table\)/i)) return `###### ${line}`
		return line;
	}).join('  \n')}
	${data.srdAttrib ? `\n:\n{{descriptive\n${data.srdAttrib}\n}}` : ''}
`
	return output;

}

export { magicItemFormat, magicItemQuery }