import { useState } from 'react'

import AutocompleteTextField from 'react-autocomplete-input';
import 'react-autocomplete-input/dist/bundle.css';

import { raceQuery } from '../types/races';
import { spellQuery } from '../types/spells';
import { srdAttribution } from '../types/srdAttribution';
import { magicItemQuery } from '../types/magicItems';
import { featQuery } from '../types/feats';
import { monsterQuery } from '../types/monsters';


function Input({ setData, type, setType }) {

	const url = 'https://www.dnd5eapi.co/api/'

	const types = [ 'monsters', 'spells', 'feats', 'magic-items', 'races' ];
	const years = [ '2014', '2024'];

	const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState([ 'aaaaa', 'aaaab' ]);

	const [ text, setText ] = useState('');
	const [ year, setYear ] = useState('2014');
	const [ srdAttrib, setSrdAttrib ] = useState(true);


	const fetchData = async function(e){
		e.preventDefault();
		if(!text) {
			setData(undefined);
			return;
		}

		const dataURL = `${url}${year}/${type}/${text}`;
		// console.log(dataURL);

		try {
			const graphQLMap = {
				'races'       : raceQuery,
				'spells'      : spellQuery,
				'magic-items' : magicItemQuery,
				'feats'       : featQuery,
				'monsters'    : monsterQuery
			}

			let response;
			if(!Object.keys(graphQLMap).includes(type)) {
				response = await fetch(dataURL);
			} else {
				console.log('GraphQL');

				response = await fetch(`https://www.dnd5eapi.co/graphql/${year}`, {
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
					<p>
						{url}
						<select onChange={(e)=>{setYear(e.target.value)}}>
							{years.map((year, index)=>{ return <option key={index}>{year}</option>;})}
						</select>
						/
						<select onChange={(e)=>{setData(); setText(''); return setType(e.target.value);}}>
							{types.sort().map((type, index)=>{ return <option key={index}>{type}</option>;})}
						</select>
						/
						<AutocompleteTextField Component="input" value={text} onChange={(e)=>{setText(e)}} options={autoCompleteSuggestions} regex={/./} trigger='' spacer='' />
					</p>
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