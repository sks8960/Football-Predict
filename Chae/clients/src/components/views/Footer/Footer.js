function Footer() {
    return (
      <footer style={footerStyle}>
        <ul style={listStyle}>
          <li><a style={linkStyle} href="https://sports.news.naver.com/wfootball/news/index?isphoto=N">해외축구 뉴스</a></li>
          <li><a style={linkStyle} href="https://m.sports.naver.com/wbaseball/video">해외축구 영상</a></li>
          <li><a style={linkStyle} href="https://sports.news.naver.com/kfootball/index">한국 축구</a></li>
          <li><a style={linkStyle} href="https://www.goal.com/kr/%EC%B9%B4%ED%85%8C%EA%B3%A0%EB%A6%AC/%EC%9D%B4%EC%A0%81/1/k94w8e1yy9ch14mllpf4srnks">이적</a></li>
          <li><a style={linkStyle} href="https://www.goal.com/kr/%EC%B1%94%ED%94%BC%EC%96%B8%EC%8A%A4%EB%A6%AC%EA%B7%B8/4oogyu6o156iphvdvphwpck10">챔피언스 리그</a></li>
          {/* 필요한 만큼 더 많은 링크를 추가하세요 */}
        </ul>
      </footer>
    );
  }
  
  // 스타일 객체를 만듭니다.
  const footerStyle = {
    
    bottom: 0, // 화면 하단에 배치
    width: '100%', // 가로 폭 100%
    background: '#333',
    color: '#fff',
    padding: '10px', // 원하는 여백 설정
    textAlign: 'center',
  };
  
  const listStyle = {
    listStyleType: 'none',
    display: 'flex',
    justifyContent: 'center',
    padding: 0,
  };
  
  const linkStyle = {
    color: '#fff',
    margin: '0 50px',
    textDecoration: 'none',
  };
  
  export default Footer;