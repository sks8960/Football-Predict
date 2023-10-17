import React, { useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import './css/CalEpl.css';

const CalEpl = () => {
    const calendarRef = useRef(null);

    useEffect(() => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.setOption('events', fetchEvents);
        }
    }, []);

    const fetchEvents = (info, successCallback, failureCallback) => {
        fetch('http://localhost:5000/cal/cal/epl')
            .then((response) => response.json())
            .then((data) => successCallback(data))
            .catch((error) => failureCallback(error));
    };

    const eventContent = (info) => {
        console.log(info.event)
        const eventDate = info.event.start;
        const fixtureId = info.event.extendedProps.fixtureId;

        const content = document.createElement('div');
        content.className = 'custom-event-content';

        // 여기서 이벤트 정보로부터 homeLogo, awayLogo를 가져옵니다.
        const { homeLogo, awayLogo } = info.event.extendedProps.title;

        // 로고 이미지를 삽입합니다.
        content.innerHTML = `
            <div class="team-logo">
                <img src="${homeLogo}" alt="Home Team Logo" />
            </div>
            <div class="team-logo">
                <img src="${awayLogo}" alt="Away Team Logo" />
            </div>
        `;

        content.addEventListener('click', () => {
            const today = new Date();

            fetch('http://localhost:5000/save-fixture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ fixtureId: fixtureId }),
            })
                .then((response) => {
                    if (response.ok) {
                        console.log('FixtureId 저장 성공');
                    } else {
                        console.log('FixtureId 저장 실패');
                    }
                })
                .catch((error) => {
                    console.log(error);
                });

            if (eventDate < today) {
                const statsPopup = window.open(
                    'http://localhost:5000/cal/statistics',
                    '_blank',
                    'width=600,height=400'
                );
                statsPopup.focus();
            } else {
                const predictionPopup = window.open(
                    'http://localhost:5000/cal/predict',
                    '_blank',
                    'width=600,height=400'
                );
                predictionPopup.focus();
            }
        });

        return { domNodes: [content] };
    };

    return (
        <div className="CalEpl">
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                eventContent={eventContent}
                width="100%"
            />
        </div>
    );
};

export default CalEpl;
