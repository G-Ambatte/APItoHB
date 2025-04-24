import dedent from 'dedent';
import _ from 'lodash';


const featFormat = function(data) {

	const featDefaults = {
		name: 'Unnamed Feat',
		prerequisites : [],
		desc: [],
	};

	_.defaultsDeep(data, featDefaults);

	const output = dedent`
	### ${data.name}
	${data.prerequisites.length ? `*Prerequisite: ${data.prerequisites.map((prereq)=>{return `${prereq.ability_score.name} ${prereq.minimum_score}`;}).join(', ')}*` : ''}  
	:
	${data.desc.map((line)=>{ return line;}).join('  \n')}
	${data.srdAttrib ? `\n:\n{{descriptive\n${data.srdAttrib}\n}}` : ''}
`
	return output;

}


export { featFormat }