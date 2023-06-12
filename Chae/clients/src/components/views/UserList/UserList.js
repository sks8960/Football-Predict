import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function UserList() {
  const [userList, setUserList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [matchingRequest, setMatchingRequest] = useState({
    fromUser: null,
    date: '',
    hour: '',
    minute: '',
    location: '',
    accepted: '',
    _id: ''
  });

  useEffect(() => {
    fetchUserList();
    getLoggedInUserId();
  }, []);

  const getLoggedInUserId = () => {
    // 사용자 인증 정보를 확인하기 위해 /api/users/auth 엔드포인트에 GET 요청 보내기
    return axios.get('/api/users/auth')
      .then(response => {
        if (response.data.isAuth) {
          setMatchingRequest(prevState => ({
            ...prevState,
            fromUserId: response.data._id
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

  const handleDateChange = date => {
    setMatchingRequest(prevState => ({
      ...prevState,
      date: date
    }));
  };

  const handleHourChange = e => {
    const { value } = e.target;
    setMatchingRequest(prevState => ({
      ...prevState,
      hour: value
    }));
  };

  const handleMinuteChange = e => {
    const { value } = e.target;
    setMatchingRequest(prevState => ({
      ...prevState,
      minute: value
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
    // 매칭 요청 전송 로직 추가
    axios
      .post('http://localhost:5000/send-matching-request', matchingRequest)
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
                selected={matchingRequest.date}
                onChange={handleDateChange}
              />
            </label>
            <br />
            <label>
              Hour:
              <input
                type="number"
                min="0"
                max="23"
                name="hour"
                value={matchingRequest.hour}
                onChange={handleHourChange}
              />
            </label>
            <br />
            <label>
              Minute:
              <input
                type="number"
                min="0"
                max="59"
                name="minute"
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
