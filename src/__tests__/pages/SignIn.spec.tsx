import React from 'react';
import SignIn from '../../pages/SignIn';
import {render} from '@testing-library/react';

describe('SignIn Page', ()=>{
    it('should be able to sign in', () =>{
        const {debug} = render(<SignIn/>);

        debug();
    })
})
