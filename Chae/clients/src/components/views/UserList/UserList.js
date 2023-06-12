import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function UserList() {
  const [userList, setUserList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [matchingRequest, setMatchingRequest] = useState({
    fromUserId: '',
    toUserId: '',
    date: new Date(),
    hour: 0,
    minute: 0,
    location: ''
  });

  const datepickerRef = useRef(null); // react-datepicker 컴포넌트의 인스턴스 참조

  useEffect(() => {
    fetchUserList();
    getLoggedInUserId();

    return () => {
      // 컴포넌트가 언마운트될 때 이벤트 핸들러 해제
      if (datepickerRef.current) {
        datepickerRef.current.destroy();
      }
    };
  }, []);

  const getLoggedInUserId = () => {
    return axios.get('/api/users/auth')
      .then(response => {
        if (response.data.isAuth) {
          setMatchingRequest(prevState => ({
            ...prevState,
            fromUserId: response.data._id,
          }));
        } else {
          throw new Error('사용자가 인증되지 않았습니다.');
        }
      })
      .catch(error => {
        console.error(error);
        throw error;
      });
  };

  const fetchUserList = () => {
    axios
      .get('http://localhost:5000/user-list')
      .then(response => {
        const userListData = response.data;
        setUserList(userListData);
      })
      .catch(error => {
        console.error('Failed to fetch user list:', error);
      });
  };

  const openModal = userId => {
    setMatchingRequest(prevState => ({
      ...prevState,
      toUserId: userId
    }));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleDatetimeChange = date => {
    const selectedDate = new Date(date); // 선택한 날짜와 시간 정보를 담은 Date 객체

    // UTC 기준의 시간을 로컬 타임존에 맞추기 위해 변환
    const year = selectedDate.getUTCFullYear();
    const month = selectedDate.getUTCMonth();
    const day = selectedDate.getUTCDate();
    const hour = matchingRequest.hour || 0; // 시간 정보가 없을 경우 0으로 설정
    const minute = matchingRequest.minute || 0; // 분 정보가 없을 경우 0으로 설정
    const newDate = new Date(year, month, day, hour, minute);

    setMatchingRequest(prevState => ({
      ...prevState,
      date: newDate
    }));
  };





  const handleHourChange = e => {
    const { value } = e.target;
    setMatchingRequest(prevState => ({
      ...prevState,
      hour: parseInt(value, 10)
    }));
  };

  const handleMinuteChange = e => {
    const { value } = e.target;
    setMatchingRequest(prevState => ({
      ...prevState,
      minute: parseInt(value, 10)
    }));
  };

  const handleLocationChange = e => {
    const { value } = e.target;
    setMatchingRequest(prevState => ({
      ...prevState,
      location: value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    axios
      .post('http://localhost:5000/api/send-matching-request', matchingRequest)
      .then(response => {
        console.log('Matching request sent successfully');
        closeModal();
      })
      .catch(error => {
        console.error('Failed to send matching request:', error);
      });
  };

  return (
    <div>
      <h1>User List</h1>
      <ul>
        {userList.map(user => (
          <li key={user._id} onClick={() => openModal(user._id)}>
            {user.name}
          </li>
        ))}
      </ul>

      {modalOpen && (
        <div>
          <h2>Matching Request</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Date:
              <DatePicker
                ref={datepickerRef}
                selected={matchingRequest.date}
                onChange={handleDatetimeChange}
              />
            </label>
            <br />
            <label>
              Hour:
              <input
                type="number"
                value={matchingRequest.hour}
                onChange={handleHourChange}
              />
            </label>
            <br />
            <label>
              Minute:
              <input
                type="number"
                value={matchingRequest.minute}
                onChange={handleMinuteChange}
              />
            </label>
            <br />
            <label>
              Location:
              <select name="location" value={matchingRequest.location} onChange={handleLocationChange}>
                <option value="">-- Select Location --</option>
                <option value="Seoul">Seoul</option>
                <option value="Busan">Busan</option>
                <option value="Incheon">Incheon</option>
                <option value="Daegu">Daegu</option>
                <option value="Daejeon">Daejeon</option>
                <option value="Gwangju">Gwangju</option>
                <option value="Sejong">Sejong</option>
                <option value="Ulsan">Ulsan</option>
                <option value="Gyeonggi">Gyeonggi</option>
                <option value="Gangwon">Gangwon</option>
                <option value="Chungcheong">Chungcheong</option>
                <option value="Jeolla">Jeolla</option>
                <option value="Gyeongsang">Gyeongsang</option>
                <option value="Jeju">Jeju</option>
              </select>
            </label>
            <br />
            <button type="submit">Send Request</button>
            <button type="button" onClick={closeModal}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default UserList;