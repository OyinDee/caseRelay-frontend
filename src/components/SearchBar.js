import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { Search as SearchIcon } from 'lucide-react';
import axios from 'axios';
import './css/SearchBar.css';

const SearchBar = ({ onSearchResults }) => {
  const [keyword, setKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsSearching(true);
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.get(
        `https://caserelay-hmaah2bddygjcgbn.canadacentral-01.azurewebsites.net/api/Case/search`, {
          params: { keyword },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      onSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Form onSubmit={handleSearch} className="search-bar-container">
      <InputGroup>
        <Form.Control
          type="text"
          placeholder="Search cases..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="search-input"
        />
        <Button 
          variant="dark" 
          type="submit"
          disabled={isSearching}
          className="search-button"
        >
          <SearchIcon size={20} />
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchBar;
