
import React from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { Routes, Route, Outlet } from 'react-router-dom';


// function Console() {
//     const n = useNavigate();
//     const d = useParams();
//     const [search, setSearch] = useSearchParams();
//     const id = search.get('id');
//     const l = useLocation();
//     console.log(d, id, l);
//     return <div onClick={() => {
//         n('', { state: { name: '212' } })
//     }}>console</div>;
// }

// export default Console;


function Console() {
    return (
        <Outlet />
    );
}

export default Console;