
import React from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { Outlet, Route } from 'react-router-dom';

function Frontend() {
    return <Outlet />;
}

export default Frontend;