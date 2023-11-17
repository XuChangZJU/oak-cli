
import React from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { Routes, Route, Outlet } from 'react-router-dom';


function Console() {
    return (
        <Outlet />
    );
}

export default Console;