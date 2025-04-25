import dedent from 'dedent';
import _ from 'lodash';


const raceFormat = function(data) {

	const raceDefaults = {
		name: 'Unnamed Spell',
		desc: [],
		higher_level : [],
		range: 'range',
		components: [],
		material : 'unknown material',
		ritual: false,
		duration: 'unknown',
		concentration: false,
		casting_time: 'unknown',
		level: 10,
		school: { name: '' },

	};

	const getStatName = function(short) {
		if(!short) return;

		const nameMap = {
			str: 'Strength',
			dex: 'Dexterity',
			con: 'Constitution',
			wis: 'Wisdom',
			int: 'Intelligence',
			cha: 'Charisma'
		};

		return nameMap[short.toLowerCase()];
	};

	_.defaultsDeep(data, raceDefaults);

	const output = dedent`
	## ${data.name}

	### ${data.name} Traits

	${data.ability_bonuses.length ? `***Ability Score Increase.*** :: ${data.ability_bonuses.sort((a, b)=>{return b.bonus - a.bonus;}).map((ability, index)=>{return `${index == data.ability_bonuses.length - 1 ? 'and ' : ''}${index == 0 ? 'Your' : 'your'} ${getStatName(ability.ability_score.name)} score increases by ${ability.bonus}`;}).join(', ')}.` : '' }
	${data.age ? `***Age.*** :: ${data.age}` : '' }
	${data.alignment ? `***Alignment.*** :: ${data.alignment}` : '' }
	${data.size ? `***Size.*** :: ${data.size_description || data.size}` : ''}
	${data.speed ? `***Speed.*** :: Your base walking speed is ${data.speed} feet.` : ''}

	${data.traits.length ? data.traits.map((trait)=>{return `***${trait.name}*** :: [WIP] ${trait.url}`}).join('  \n') : ''}
	${data.language_desc ? `***Languages.*** :: ${data.language_desc}` : '' }
	${data.srdAttrib ? `\n:\n{{descriptive\n${data.srdAttrib}\n}}` : ''}
`
	return output;

}

export { raceFormat }