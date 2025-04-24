import dedent from 'dedent';
import _ from 'lodash';

const magicItemFormat = function(data) {

	const magicItemDefaults = {
		name: 'Unnamed Spell',
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

export { magicItemFormat }