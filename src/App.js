import React, {useReducer, useRef, useState, useCallback, useMemo} from 'react';
import produce from 'immer';

import CreateUser from './component/CreateUser';
import UserList from './component/UserList';
import useInputs from './hooks/useInputs';


function countActiveUsers(users) {
  console.log('활성 사용자 수를 세는중...')
  return users.filter(user => user.active).length;
}

// 초기 상테
const initialState = {
  // inputs: {
  //   id:'',
  //   username: '',
  //   email: '',
  // },
  users: [
    {
      id: 1,
      username: '경아',
      email: 'kyung@naver.com',
      active: true,
    },
    {
      id: 2,
      username: '홍길동',
      email: 'hong@naver.com',
      active: false,
    },
    {
      id: 3,
      username: '김미영',
      email: 'kim@naver.com',
      active: false,
    }
  ]
};

// reducer
function reducer(state, action) {
  // console.log(state);

  switch (action.type) {
    // case 'CHANGE_INPUT':
    //    return {
    //      ...state,
    //      inputs: {
    //        ...state.inputs,     // 불변성을 지켜줘야해서 스프레드 연산자 사용
    //        [action.name]: action.value   // 여러개 input name과 value를 대응
    //      }
    //    };
    case 'CREATE_USER':
      return{
        // inputs: initialState.inputs,  // input 초기값으로 되돌림
        users: state.users.concat(action.user) // 배열에 추가
      };
    case 'TOGGLE_USER':
      return {
        ...state,
        users: state.users.map(user => user.id === action.id ? {...user, active: !user.active} : user)
      };
    case 'REMOVE_USER':
      // immer 사용해보기
      return produce(state, draft => {
        const index = draft.users.findIndex(user => user.id === action.id);
        draft.users.splice(index, 1);
      })
      // return {
      //   ...state,
      //   users: state.users.filter(user => user.id !== action.id)
      // };
    case 'MODIFY_USER':
      return {
        ...state,
        inputs: {
          ...state.inputs,
          id: action.id,
          username: action.username,
          email: action.email,
        }
      };
    case 'UPDATE_USER':
      return {
        users: state.users.map(user => user.id === action.id ? {...user, username: state.inputs.username, email: state.inputs.email} : user),
        inputs: initialState.inputs
      }
    default: 
      return state;
  }
}


// Context API
export const UserDispatch = React.createContext(null);


function App() {
  const [{id, username, email}, onChange, reset] = useInputs({
    id: '',
    username:'',
    email: '',
  });
  
  const [state, dispatch] = useReducer(reducer, initialState);

// useRef 훅은 컴포넌트에서 특정 DOM을 선택하거나 컴포넌트 안에서 조회 및 수정할 수 있는 변수를 관리할 수 있음
// 1. setTimeout, serInterval을 통해서 만들어진 id
// 2. 외부 라이브러리를 사용하여 생성된 인스턴스
// 3. 스크롤의 위치
// 위 세가지의 값을 관리할 수 있다
  const nextId = useRef(4);

  // 비구조할당 문법을 이용해 state에서 필요한 값을 각 컴포넌트에 전달
  const {users} = state;
  
  // const {id, username, email} = state.inputs;

  // input 값 바꿈 ----> custom Hook으로 변경
  // const onChange = useCallback((e) => {
  //   const {name, value} = e.target;

  //   dispatch({
  //     type: 'CHANGE_INPUT',
  //     name,
  //     value
  //   });
  // }, []);


  // 유저 추가
  const onCreate = useCallback(() => {
    dispatch({
      type: 'CREATE_USER',
      user: {
        id: nextId.current,
        username,
        email
      }
    });
    reset();
    nextId.current += 1;
  }, [username, email, reset]);


  // active 토글 ---> context api로 변경
  // const onToggle = useCallback((id) => {
  //   dispatch({
  //     type: 'TOGGLE_USER',
  //     id
  //   });
  // }, []);


  // 삭제 ---> context api로 변경
  // const onRemove = useCallback((id) => {
  //   dispatch({
  //     type: 'REMOVE_USER',
  //     id
  //   });
  // }, []);


  // 수정
  // TODO 커스텀 훅 분리에따른 기능 재구현 필요
  const onModify = useCallback((id) => {
    dispatch({
      type: 'MODIFY_USER',
      id: id.id,
      username: id.username,
      email: id.email,
    });
  }, []);
  


  // 업데이트
  const onUpdate = useCallback(() => {
    dispatch({
      type: 'UPDATE_USER',
      id,
      username,
      email
    });
  }, [id, username, email]);


  // 카운트
  const count = useMemo(() => countActiveUsers(users), [users]);

  return (
    // dispatch(리듀서 함수의 액션을 실행시켜주는)를 어디서든 쓸 수 있게 전역 설정
    <UserDispatch.Provider value={dispatch}>
      <CreateUser username={username} email={email} onChange={onChange} onCreate={onCreate} onUpdate={onUpdate} />
      <UserList users={users} onModify={onModify} />
      <div>활성 사용자 수 : {count}</div>
    </UserDispatch.Provider>
  );
}

export default App;
