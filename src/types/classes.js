import dedent from 'dedent';
import _ from 'lodash';


const classQuery = `query Class ($index: String ) {
  class(index: $index) {
    name
    hit_die
    class_levels {
      level
      prof_bonus
      spellcasting {
        cantrips_known
        spell_slots_level_1
        spell_slots_level_2
        spell_slots_level_3
        spell_slots_level_4
        spell_slots_level_5
        spell_slots_level_6
        spell_slots_level_7
        spell_slots_level_8
        spell_slots_level_9
        spells_known
      }
      features {
        name
        desc
      }
      class_specific {
        ... on BarbarianSpecific {
          rage_count
          rage_damage_bonus
          brutal_critical_dice
        }
        ... on BardSpecific {
          bardic_inspiration_die
          song_of_rest_die
          magical_secrets_max_5
          magical_secrets_max_7
          magical_secrets_max_9
        }
        ... on ClericSpecific {
          channel_divinity_charges
          destroy_undead_cr
        }
        ... on DruidSpecific {
          wild_shape_max_cr
          wild_shape_swim
          wild_shape_fly
        }
        ... on FighterSpecific {
          action_surges
          indomitable_uses
          extra_attacks
        }
        ... on MonkSpecific {
          martial_arts {
            dice_count
            dice_value
          }
          ki_points
          unarmored_movement
        }
        ... on PaladinSpecific {
          aura_range
        }
        ... on RangerSpecific {
          favored_enemies
          favored_terrain
        }
        ... on RogueSpecific {
          sneak_attack {
            dice_count
            dice_value
          }
        }
        ... on SorcererSpecific {
          sorcery_points
          metamagic_known
          creating_spell_slots {
            sorcery_point_cost
            spell_slot_level
          }
        }
        ... on WarlockSpecific {
          invocations_known
          mystic_arcanum_level_6
          mystic_arcanum_level_7
          mystic_arcanum_level_8
          mystic_arcanum_level_9
        }
        ... on WizardSpecific {
          arcane_recovery_levels
        }
      }
      subclass {
        name
      }
    }
    proficiencies {
      name
      type
      reference {
        ... on AbilityScore {
          full_name
        }
      }
    }
    starting_equipment_options {
      desc
    }
    starting_equipment {
      equipment {
        name
      }
      quantity
    }
    proficiency_choices {
      desc
    }
  }
}`;

const classSuggestionsQuery = `query Classes {
	classes {
	  index
	}
}`;

const classFormat = function(responseData) {

  if(!responseData?.data?.class) return;
	const data = responseData.data.class;
	if(responseData.data?.srdAttrib){ data.srdAttrib = responseData.data.srdAttrib};

	const classDefaults = {
	};

	_.defaultsDeep(data, classDefaults);

	const output = dedent`

[class_name]: ${data.name}

[hit_die]: ${data.hit_die}


# $[class_name]

## Class Features

As a $[class_name], you gain the following features:

### Hit Points

**Hit Dice:** :: 1d$[hit_die] per $[class_name] level
**Hit Point at 1st Level:** :: $[hit_die] + your Constitution modifier
**Hit Points at Higher Levels:** :: 1d$[hit_die] (or $[hit_die / 2 + 1]) + your Constitution modifier per $[class_name] level after 1st

### Proficiencies

**Armor:** :: ${data.proficiencies.filter((prof)=>{return prof.type == 'ARMOR';}).map((prof)=>{return prof.name;}).join(', ') || 'None'}
**Weapons:** :: ${data.proficiencies.filter((prof)=>{return prof.type == 'WEAPONS';}).map((prof)=>{return prof.name;}).join(', ') || 'None'}
**Tools:** :: ${data.proficiencies.filter((prof)=>{return prof.type == 'ARTISANS_TOOLS';}).map((prof)=>{return prof.name;}).join(', ') || 'None'}
**Saving Throws:** :: ${data.proficiencies.filter((prof)=>{return prof.type == 'SAVING_THROWS';}).map((prof)=>{return prof.reference.full_name;}).join(', ') || 'None'}
**Skills:** :: ${data.proficiency_choices.map((prof_choice)=>{return prof_choice.desc}).join(' ') || 'None'}

### Equipment

You start with the following equipment, in addition to the equipment granted by your background:

${data.starting_equipment_options.map((equip_option)=>{return `- ${equip_option.desc}`;}).join('  \n')}
${data.starting_equipment.map((equip)=>{return `- ${equip.quantity}x ${equip.equipment.name}`}).join(', ')}

{{classTable,frame,wide
###### $[class_name]

| Level | Proficiency Bonus | Features |${data.class_levels.filter((level)=>{return level.level == 20 && level.spellcasting}).length ? ` Cantrips Known | 1 | 2 | 3 | 4 | 5 |${data.class_levels.filter((level)=>{return level.level == 20})[0].spellcasting?.spell_slots_level_9 ? ' 6 | 7 | 8 | 9 |' : ''}` : '' }
|:-----:|:-----------------:|:---------|${data.class_levels.filter((level)=>{return level.level == 20 && level.spellcasting}).length ? `:-:|:-:|:-:|:-:|:-:|:-:|${data.class_levels.filter((level)=>{return level.level == 20})[0].spellcasting?.spell_slots_level_9 ? ':-:|:-:|:-:|:-:|' : ''}` : '' }
${data.class_levels
    .filter((level)=>{
      return !level.subclass;
    })
    .sort((a,b)=>{return a.level > b.level})
    .map((level)=>{
      return `| ${level.level} | ${level.prof_bonus} | ${level.features.map((feature)=>{return feature.name;}).join(', ')} | ${level.spellcasting ? `${level.spellcasting.cantrips_known || '-'} | ${level.spellcasting.spell_slots_level_1 || '-'} | ${level.spellcasting.spell_slots_level_2 || '-'} | ${level.spellcasting.spell_slots_level_3 || '-'} | ${level.spellcasting.spell_slots_level_4 || '-'} | ${level.spellcasting.spell_slots_level_5 || '-'} | ${level.spellcasting.spell_slots_level_6 || '-'} | ${level.spellcasting.spell_slots_level_7 || '-'} | ${level.spellcasting.spell_slots_level_8 || '-'} | ${level.spellcasting.spell_slots_level_9 || '-'} |` : ''}`;
    })
    .join('  \n')}
}}

\page

${_.uniqBy(
    data.class_levels
      .filter((level)=>{return !level.subclass;})                             // Eliminate subclass specific level
      .sort((a,b)=>{return a.level > b.level;})                               // Ensure they are sorted 1 => 20
      .map((level)=>{return level.features;})                                 // Extract only features
      .flat()                                                                 // Flatten the array
      .filter((feature)=>{return feature.name.slice(-7) !== 'feature';})      // Remove any features that end in 'feature'; these are improvements on an existing feature
      .map((feature)=>{ return {
        ...feature,
        name: feature.name.replace(/(\(.*\))$/, '')                           // Eliminate any parts of feature names in parentheses
      };
    }),
      (a)=>{return a.name;}                                                   // Eliminate duplicate names in feature array
    )
    .map((feature)=>{
      return dedent`
      ### ${feature.name}
      
      ${feature.desc.join('\n')}
      
      :
      `;
    }).join('\n\n')
}


${data.srdAttrib ? `\n:\n\\page\n\n{{descriptive,wide\n${data.srdAttrib}\n}}` : ''}
`
	return output;

}

export { classFormat, classQuery, classSuggestionsQuery }