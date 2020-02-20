import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@emotion/core';

import Loader from './Loader';

const styles = {
  main: css`
    height: 100vh;
    display: flex;
    align-items: center;
    flex-direction: raw;
    justify-content: center;
    div {
      button{
        cursor: pointer;
        margin: 20px auto;
        outline:0;
        font-size:1em;
        font-weight:600;
        background:#fff;
        border:none;
        padding:2em 4em;
        transition:all .3s ease-out;
        box-shadow:inset 0 -8px 0 0 rgba(0,0,0,.2),
          1px 1px 0 0 #d98e20,
          2px 2px 0 0 #d98e20,
          3px 3px 0 0 #d98e20,
          4px 4px 0 0 #d98e20,
          5px 5px 0 0 #d98e20,
          6px 6px 0 0 #d98e20,
          7px 7px 0 0 #d98e20,
          8px 8px 0 0 #d98e20,
          9px 9px 0 0 #d98e20,
          10px 10px 0 0 #d98e20,
          11px 11px 0 0 #d98e20,
          12px 12px 0 0 #d98e20;
      }
      button:hover:enabled, button:focus:enabled {
        color:#444;
        box-shadow:inset 0 -6px 0 0 rgba(0,0,0,.2),
          1px 1px 0 0 #d98e20,
          2px 2px 0 0 #d98e20,
          3px 3px 0 0 #d98e20,
          4px 4px 0 0 #d98e20,
          5px 5px 0 0 #d98e20,
          6px 6px 0 0 #d98e20,
          7px 7px 0 0 #d98e20,
          8px 8px 0 0 #d98e20,
          9px 9px 0 0 #d98e20,
          10px 10px 0 0 #d98e20,
          11px 11px 0 0 #d98e20,
          12px 12px 0 0 #d98e20;
      }
      button:enabled:active {
          color:#222;
          box-shadow:inset 0 -4px 0 0 rgba(0,0,0,.2),
            1px 1px 0 0 #d98e20,
            2px 2px 0 0 #d98e20,
            3px 3px 0 0 #d98e20,
            4px 4px 0 0 #d98e20,
            5px 5px 0 0 #d98e20;

        }
      }

    }
    div>* {
      text-align: center;
      width: 300px;
    }
  `,
  input: css`
    border-bottom: 8px solid #d98e20;
    font-size: 18px;
  `,
  join: css`
  `,
  create: css`
  `,
};

const Home = (props) => {

  if (props.error) {
    //  handle error here or redirect to general error page
    return <p>Home error: {props.error.message}</p>
  }

  if (!props.state) {
    return (
      <main css={styles.main}>
        <div>
          <Loader />
        </div>
      </main>
    );
  }

  const [nickname, setNickname] = useState('');
  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      console.log(nickname);
    }
  }

  return (
    <main css={styles.main}>
      <div>
          <input css={styles.input} id="nickname" type="text" placeholder="Enter nickname..."
          onChange={(e) => { setNickname(e.target.value)}}
          onKeyDown={onKeyDown} />
          <button disabled={!nickname} css={styles.join} type="button">Lobby</button>
          <button disabled={!nickname} css={styles.create} type="button">Create room</button>
      </div>
    </main>
  );
};

export default Home;
