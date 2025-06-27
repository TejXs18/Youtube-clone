import React from 'react';
import { FaSearch } from 'react-icons/fa';
import './Searchlist.css';

const Searchlist = ({ Titlearray, setSearchQuery }) => {
  if (!Array.isArray(Titlearray)) return null;

  return (
    <div className="Container_SearchList">
      {Titlearray.map((title) => (
        <p key={title} onClick={() => setSearchQuery(title)} className="titleItem">
          <FaSearch style={{ marginRight: '8px' }} />
          {title}
        </p>
      ))}
    </div>
  );
};

export default Searchlist;
