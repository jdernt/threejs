import React, { Component } from 'react';
import data from '../data';


export default class Minimap extends Component {
	render() {
		const { currentId, action } = this.props;
		return (
			<div className="map" onClick={action} >
				{data.map(({ id, coords }) => (
					<span className="map__item" key={id} 
						style={{	top: coords.z * 15 + 20 + 'px',
											left: coords.x * 15 + 150 + 'px',
											backgroundColor: id === currentId ? '#42f5e3' : '#3b04b3'
										}}>								
					</span>
				))}
			</div>
		);
	}
}
