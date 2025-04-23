import { useState } from 'react'

import { monsterRegex } from '../types/monster.js'
import { spellRegex } from '../types/spell.js'
import { featRegex } from '../types/feats.js'

function Input({ setData, setType }) {

	const url = 'https://www.dnd5eapi.co/api/'

	const [ text, setText ] = useState('');
	const [ year, setYear ] = useState('2014')

	const parseTypeFromUrl = function(url){
		const regexMap = {
			monster : monsterRegex,
			spell   : spellRegex,
			feat    : featRegex
		};

		return Object.keys(regexMap).filter((regexKey)=>{
			return url.match(regexMap[regexKey]);
		})[0];

	}

	const fetchData = async function(e){
		e.preventDefault();
		if(!text) {
			setData(undefined);
			setType(undefined);
			return;
		}

		const dataURL = `${url}${year}/${text}`

		try {
			const response = (await fetch(dataURL));
			if (!response.ok) {
			  throw new Error(`Response status: ${response.status}`);
			}
		
			const json = await response.json();
			setData(json)

			setType(parseTypeFromUrl(dataURL));


			return
		  } catch (error) {
			console.error(error.message);
		  }
		setData(undefined);
		setType(undefined);
	};

	return <>
		<div className='input'>
			<form onSubmit={fetchData}>
				<label>
					<p>
						{url}
						<select onChange={(e)=>{setYear(e.target.value)}}>
							<option>2014</option>
							<option>2024</option>
						</select>
						<input type='text' value={text} onChange={(e)=>{setText(e.target.value)}}></input>
					</p>
				</label>
				<input type="submit" value="Fetch"></input>
			</form>
		</div>
	</>;
}

export default Input;