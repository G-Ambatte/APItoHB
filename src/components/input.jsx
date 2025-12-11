import './input.css'

import { useState, useEffect } from 'react'
import camelCase from 'camelcase';

import AutocompleteTextField from 'react-autocomplete-input';
import 'react-autocomplete-input/dist/bundle.css';

import { raceQuery, raceSuggestionsQuery } from '../types/races';
import { spellQuery, spellSuggestionsQuery } from '../types/spells';
import { srdAttribution } from '../types/srdAttribution';
import { magicItemQuery, magicItemSuggestionsQuery } from '../types/magicItems';
import { featQuery, featSuggestionsQuery } from '../types/feats';
import { monsterQuery, monsterSuggestionsQuery } from '../types/monsters';
import { subRaceQuery, subRaceSuggestionsQuery } from '../types/subraces';
import { classQuery, classSuggestionsQuery } from '../types/classes';
import { subClassQuery, subClassSuggestionsQuery } from '../types/subclasses';


const URL = 'https://www.dnd5eapi.co';

function Input({ setData, type, setType }) {
	const types = [ 'monsters', 'spells', 'feats', 'magic-items', 'races', 'subraces', 'classes', 'subclasses' ];
	// const years = [ '2014', '2024'];
	const years = [ '2014' ]; // Only 2014 for now

	const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState([ '', '' ]);

	const [ text, setText ] = useState('');
	const [ year, setYear ] = useState('2014');
	const [ srdAttrib, setSrdAttrib ] = useState(true);

	useEffect(()=>{
		const suggestionsMap = {
			'classes'     : classSuggestionsQuery,
			'feats'       : featSuggestionsQuery,
			'magic-items' : magicItemSuggestionsQuery,
			'monsters'    : monsterSuggestionsQuery,
			'races'       : raceSuggestionsQuery,
			'spells'      : spellSuggestionsQuery,
			'subraces'    : subRaceSuggestionsQuery,
			'subclasses'  : subClassSuggestionsQuery
		};
		if(!Object.keys(suggestionsMap).includes(type)){
			console.log('Unknown type for suggestions');
			setAutoCompleteSuggestions([]);
			return;
		}

		const fetchSuggestions = async ()=>{
			const response = await fetch(`${URL}/graphql/${year}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body : JSON.stringify({
					query     : suggestionsMap[type],
					variables : { limit: 500 }
				})
			})

			const suggestionData = await response.json();
			const suggestions = suggestionData.data[camelCase(type)].sort((a,b)=>{return a.index > b.index;}).map((suggestion)=>{return suggestion.index;});

			setAutoCompleteSuggestions(suggestions);
		}
		fetchSuggestions();
		setData();
		setText(''); 
	}, [type, year, setData])

	const fetchData = async function(e){
		e.preventDefault();
		if(!text) {
			setData(undefined);
			return;
		}

		const dataURL = `${URL}/api/${year}/${type}/${text}`;
		// console.log(dataURL);

		try {
			const graphQLMap = {
				'classes'     : classQuery,
				'feats'       : featQuery,
				'magic-items' : magicItemQuery,
				'monsters'    : monsterQuery,
				'races'       : raceQuery,
				'spells'      : spellQuery,
				'subraces'    : subRaceQuery,
				'subclasses'  : subClassQuery
			}

			let response;
			if(!Object.keys(graphQLMap).includes(type)) {
				response = await fetch(dataURL);
			} else {
				response = await fetch(`${URL}/graphql/${year}`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body : JSON.stringify({
						query     : graphQLMap[type],
						variables : { index : text }
					})
				})
			}
			if (!response.ok) {
			  throw new Error(`Response status: ${response.status}`);
			}
		
			const apiData = await response.json();
			if(srdAttrib){
				const srdMap = {
					'2014' : '5.1',
					'2024' : '5.2'
				}
				apiData.data = { 
					...apiData.data,
					srdAttrib : srdAttribution(srdMap[year])
				};
			};

			setData(apiData)
			return
		  } catch (error) {
			console.error(error.message);
		  }
		setData(undefined);
	};

	return <>
		<div className='input'>
			<form onSubmit={fetchData}>
				<label>
					<span>
						{URL}
						/
						<select onChange={(e)=>{setYear(e.target.value)}}>
							{years.map((year, index)=>{ return <option key={index}>{year}</option>;})}
						</select>
						/
						<select onChange={(e)=>{setType(e.target.value);}}>
							{types.sort().map((type, index)=>{ return <option key={index}>{type}</option>;})}
						</select>
						/
						<AutocompleteTextField Component="input" value={text} onChange={(e)=>{setText(e)}} options={autoCompleteSuggestions} regex={/./} trigger='' spacer='' />
					</span>
				</label>
				<input type="submit" value="Fetch"></input>
				<label>
					<p>
						Include attribution?
						<input type='checkbox' defaultChecked={srdAttrib} onChange={()=>{
							setSrdAttrib(!srdAttrib);
						}}/>
					</p>
				</label>
			</form>
		</div>
	</>;
}

export default Input;