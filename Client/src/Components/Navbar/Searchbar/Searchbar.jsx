import React, { useState } from 'react';
import './Searchbar.css';
import { BsMicFill } from 'react-icons/bs';
import { FaSearch } from 'react-icons/fa';
import Searchlist from './Searchlist';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Searchbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchList, setSearchList] = useState(false);
  const Titlearray = useSelector(s => s?.videoreducer)?.data
    ?.filter(q => q?.videotitle.toUpperCase().includes(searchQuery?.toUpperCase()))
    .map(m => m?.videotitle);

  return (
    <div className="SearchBar_Container">
      <div className="SearchBar_Container2">
        <div className="search_div">
          <input
            type="text"
            className="iBox_SearchBar"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onClick={() => setSearchList(true)}
            onBlur={() => setTimeout(() => setSearchList(false), 150)}
          />
          <Link to={`/search/${searchQuery}`}>
            <FaSearch className="searchIcon_SearchBar" />
          </Link>
          <BsMicFill className="Mic_SearchBar" />
          {searchQuery && searchList && (
            <Searchlist setSearchQuery={setSearchQuery} Titlearray={Titlearray} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Searchbar;
