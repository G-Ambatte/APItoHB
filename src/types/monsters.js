import dedent from 'dedent';
import _ from 'lodash';


const monsterQuery = `query MonsterQuery($index: String) {
  monster(index: $index) {
    name
    size
    type
    alignment
    armor_class {
      value
      type
    }
    hit_points
    hit_points_roll
    speed {
      walk
      fly
      hover
      swim
      climb
      burrow
    }
    strength
    dexterity
    constitution
    intelligence
    wisdom
    charisma
    proficiencies {
      proficiency {
        index
        name
      }
      value
    }
    damage_vulnerabilities
    damage_resistances
    damage_immunities
    condition_immunities {
      name
    }
    senses {
      passive_perception
      darkvision
      blindsight
      tremorsense
      truesight
    }
    languages
    challenge_rating
    xp
    proficiency_bonus

    special_abilities {
      name
      usage {
        times
        type
      }
      desc
    }
    actions {
      name
      desc
    }
    legendary_actions {
      name
      desc
    }
    image
  }
}`;

const monsterSuggestionsQuery = `query Monsters($limit: Int!) {
	monsters(limit: $limit) {
	  index
	}
  }`;

const monsterFormat = function(responseData, url) {

	if(!responseData?.data?.monster) return;
	const data = responseData.data.monster;
	if(responseData.data?.srdAttrib){ data.srdAttrib = responseData.data.srdAttrib};

	const monsterDefaults = {
		name: 'Unnamed Monster',
		size: 'Any size',
		type: 'unknown type',
		alignment: 'unaligned',
		armor_class: [{value: 10, type: 'unarmored'}],
		hit_points: 1,
		hit_points_roll: '1d1 + 0',
		speed: { 'walk' : '30ft.' },
		strength: 10,
		dexterity: 10,
		constitution: 10,
		intelligence: 10,
		wisdom: 10,
		charisma: 10,
		proficiencies: [ ],
		damage_vulnerabilities : [ ],
		damage_resistance : [ ],
		damage_immunities : [ ],
		condition_immunities : [ ],
		senses: { passive_perception : 10 },
		languages : 'None',
		challenge_rating : 0,
		xp : 'None',
		proficiency_bonus : 0
	};

	_.defaultsDeep(data, monsterDefaults);

	// Tweak format for flying monsters that can hover
	if(data.speed.hover){
		data.speed.hover = null;
		data.speed.fly = `${data.speed.fly} (hover)`
	}
	// Remove all null speed entries
	data.speed = Object.fromEntries(Object.entries(data.speed).filter(([ , value])=>{ return value != null; }));

	const capitalize = function(text) {

		return `${text.slice(0,1).toUpperCase()}${text.slice(1).toLowerCase()}`;
	};
		
	const output = dedent`{{monster,frame
	## ${data.name}
	*${capitalize(data.size)} ${data.type.toLowerCase()}, ${data.alignment}*
	___
	**Armor Class** :: ${data.armor_class.map((ac)=>{ return `${ac.value} (${ac.type})`; })}
	**Hit Points**  :: ${data.hit_points} (${data.hit_points_roll})
	**Speed**       :: ${Object.keys(data.speed).map((speed)=>{ return `${speed !== 'walk' ? speed : '' } ${data.speed[speed]}`}).join(', ')}
	___
	|  STR  |  DEX  |  CON  |  INT  |  WIS  |  CHA  |
	|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
	|${data.strength} ($[signed(${Math.floor((data.strength - 10) / 2)})])|${data.dexterity} ($[signed(${Math.floor((data.dexterity - 10) / 2)})])|${data.constitution} ($[signed(${Math.floor((data.constitution - 10) / 2)})])|${data.intelligence} ($[signed(${Math.floor((data.intelligence - 10) / 2)})])|${data.wisdom} ($[signed(${Math.floor((data.wisdom - 10) / 2)})])|${data.charisma} ($[signed(${Math.floor((data.charisma - 10) / 2)})])|
	___
	**Saving Throws**          :: ${data.proficiencies.filter((prof)=>{return prof.proficiency.index.startsWith('saving-throw');}).map((prof)=>{ return `${prof.proficiency.name?.slice(-3)} $[signed(${prof.value})]`;}).join(', ') || 'None'}
	**Skills**                 :: ${data.proficiencies.filter((prof)=>{return !prof.proficiency.index.startsWith('saving-throw');}).map((prof)=>{ return `${prof.proficiency.name?.slice(7)} $[signed(${prof.value})]`;}).join(', ') || 'None'}
	**Damage Vulnerabilities** :: ${data.damage_vulnerabilities?.length ? data.damage_vulnerabilities.join(', ') : 'None'}
	**Damage Resistances**     :: ${data.damage_resistances?.length ? data.damage_resistances.join(', ') : 'None'}
	**Damage Immunities**      :: ${data.damage_immunities?.length ? data.damage_immunities.join(', ') : 'None'}
	**Condition Immunities**   :: ${data.condition_immunities?.length ? data.condition_immunities.map((condition_immunity)=>{return condition_immunity.name;}).join(', ') : 'None'}
	**Senses**                 :: ${Object.keys(data.senses).filter((sense)=>{ return data.senses[sense]; }).map((sense)=>{ return `${sense != 'passive_perception' ? sense : 'passive perception' } ${data.senses[sense]}` }).join(', ')}
	**Languages**              :: ${data.languages || 'None'}
	**Challenge**              :: ${data.challenge_rating} (${data.xp} XP) {{bonus **Proficiency Bonus** $[signed(${data.proficiency_bonus})]}}
	___
	${data.special_abilities?.length ?
	`### Traits
	${data.special_abilities.map((special)=>{
		return `***${special.name}.***${special.usage ? ` **(${special.usage.times} ${special.usage.type})**` : ''} ${special.desc}`;
	}).join('\n:\n')
	}
	`		
	: ''
	}	
	${data.actions?.length ? 
	`:
	### Actions
	${data.actions.map((action)=>{return `***${action.name}.*** ${action.desc}`}).join('\n:\n')}`
	: ''
	}
	${data.legendary_actions?.length ?
	`:
	### Legendary Actions
	${data.legendary_actions.map((legendary)=>{return `***${legendary.name}.*** ${legendary.desc}`}).join('\n:\n')}`
	 : ''}
	}}

	${data.image ? `![image](${url}${data.image})` : ''}
	${data.srdAttrib ? `\n:\n{{descriptive\n${data.srdAttrib}\n}}` : ''}
	`;

	return output;

};

export { monsterFormat, monsterQuery, monsterSuggestionsQuery };