import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { Search as SearchIcon } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import './css/SearchBar.css';
import { api } from '../config/api';

const SearchBar = ({ onSearchResults }) => {
  const [keyword, setKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsSearching(true);
    try {
      const response = await api.get('/case/search', {
        params: { keyword }
      });
      onSearchResults(response.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || 'Search failed');
      } else {
        toast.error('An unexpected error occurred');
      }
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
          {isSearching ? (
            <span className="spinner-border spinner-border-sm" />
          ) : (
            <SearchIcon size={20} />
          )}
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchBar;
