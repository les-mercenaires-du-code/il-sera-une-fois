import React from 'react';
import { css } from '@emotion/core';
import { NavLink } from 'react-router-dom';


export default (props) => {

  const menu = [
    {
      name: 'Child',
      param: '/child/id',
    },
    {
      name: 'GrandChild',
      param: '/child/id/grand-child',
    },
    {
      name: 'Private',
      param: '/dashboard',
    },
    {
      name: 'Rooms',
      param: '/rooms',
    },
    {
      name: 'Not Found',
      param: '/nimp',
    },
  ];

  const styles = {
    header: css`
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 25px;
      flex-direction: row;
      @media (max-width: 535px) {
        align-items: start;
        justify-content: space-between;
      }
    `,
    logo: css`
      cursor: pointer;
      margin-top: 5px;
      color: white;
      text-transform: uppercase;
      @media (min-width: 535px) {
        margin-right: auto;
        margin-top: 0px;
      }
    `,
    toggle: css`
      display: inline-block;
      padding: 0 10px;
      @media (min-width: 535px) {
        display: none;
      }
    `,
    ul: css`
      @media (max-width: 535px) {
        flex-direction: column;
        text-align: center;
      }
    `,
    li: css`
      display: inline-block;
      padding: 0 10px;
      @media (max-width: 535px) {
        margin: auto;
        padding: 5px 10px;
      }
    `,
    a: css`
      transition: all 0.3s ease 0s;
      text-decoration: underline;
      color: #edf0f1;
      :hover {
        color: #0088a9;
      }
      &.is-active {
        color: yellow;
      }
    `,
  };

  return (
    <header css={styles.header}>

      <NavLink
        exact={true}
        css={styles.logo}
        to='/'
      >
        Il sera une fois
      </NavLink>


      <ul css={styles.ul}>
        <li css={styles.toggle}></li>
        {
          menu.map(({ name, param }) => (
            <li css={styles.li} key={param}>
              <NavLink
                exact={true}
                activeClassName="is-active"
                css={styles.a}
                to={param}
              >
                {name}
              </NavLink>
            </li>
          ))
        }
      </ul>

    </header>
  );
};
