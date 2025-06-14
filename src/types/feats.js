import dedent from 'dedent';
import _ from 'lodash';

const featQuery = `query Feat($index: String!) {
  feat(index: $index) {
    name
    prerequisites {
      ability_score {
        full_name
      }
      minimum_score
    }
    desc
  }
}`;

const featSuggestionsQuery = `query Feats {
  feats {
    index
  }
}`;

const featStructure = {
	name: '',
	prerequisites: [],
	desc: []
};

const featFormat = function(responseData) {

	if(!responseData?.data?.feat) return;
	const data = responseData.data.feat;
	if(responseData.data?.srdAttrib){ data.srdAttrib = responseData.data.srdAttrib};

	_.defaultsDeep(data, featStructure);

	const output = dedent`
	### ${data.name}
	${data.prerequisites.length ? `*Prerequisite: ${data.prerequisites.map((prereq)=>{return `${prereq.ability_score.full_name} ${prereq.minimum_score}`;}).join(', ')}*` : ''}  
	:
	${data.desc.map((line)=>{ return line;}).join('  \n')}
	${data.srdAttrib ? `\n:\n{{descriptive\n${data.srdAttrib}\n}}` : ''}
`
	return output;

}


export { featFormat, featQuery, featSuggestionsQuery, featStructure }