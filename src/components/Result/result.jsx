import './result.css'

import { useState, useEffect } from 'react'

import { monsterFormat } from '../../types/monsters';
import { spellFormat } from '../../types/spells';
import { featFormat } from '../../types/feats';
import { magicItemFormat } from '../../types/magicItems';
import { raceFormat } from '../../types/races';
import { subRaceFormat } from '../../types/subraces';
import { classFormat } from '../../types/classes';

function Result({ data, type }) {

	const [ activeTab, setActiveTab ] = useState('homebrewery');
	const [ text, setText ] = useState('');
	const [ copyState, setCopyState] = useState(false);

	useEffect(()=>{
		setCopyState(false);
	}, [data])

	useEffect(()=>{
		if(!data) return;
		const url = 'https://www.dnd5eapi.co';

		const outputMap = {
			'monsters'    : monsterFormat,
			'spells'      : spellFormat,
			'feats'       : featFormat,
			'magic-items' : magicItemFormat,
			'races'       : raceFormat,
			'subraces'    : subRaceFormat,
			'classes'     : classFormat
		}

		if(activeTab == 'homebrewery') setText(outputMap[type] ? outputMap[type](data, url) : '');
		if(activeTab == 'raw') setText(JSON.stringify(data));

		setCopyState(false);

	},	[activeTab, type, data])

	if(!data) return;


	const copyToClipboard = function(){
		navigator.clipboard.writeText(text);
		setCopyState(true);
	}

	const tabs = [ 'Homebrewery', 'Raw'];

	return <>
		<div className='result'>
			<div className='tabs'>
				{tabs.map((tab, index)=>{return <button key={index} onClick={()=>{setActiveTab(tab.toLowerCase());}}>{tab}</button>})}
			</div>
			<textarea className='result' defaultValue={text}></textarea>
			<button onClick={copyToClipboard}>{copyState ? 'Copied!' : 'Copy'}</button>
		</div>
	</>
}

export default Result