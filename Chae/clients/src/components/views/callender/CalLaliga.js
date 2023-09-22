import React, { useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const CalEpl = () => {
    const calendarRef = useRef(null);

    useEffect(() => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.setOption('events', fetchEvents);
        }
    }, []);

    const fetchEvents = (info, successCallback, failureCallback) => {
        fetch('http://localhost:5000/cal/cal/laliga')
            .then((response) => response.json())
            .then((data) => successCallback(data))
            .catch((error) => failureCallback(error));
    };

    const eventDidMount = (info) => {
        const eventElement = info.el;
        const eventDate = info.event.start;

        if (eventElement.innerText.length > 10) {
            tippy(eventElement, {
                content: eventElement.innerText,
                placement: 'top',
                maxWidth: 200,
            });
        }

        eventElement.addEventListener('click', () => {
            const today = new Date();
            const fixtureId = info.event.extendedProps.fixtureId;

            fetch('http://localhost:5000/save-fixture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "include",
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
    };

    return (
        <div>
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                eventDidMount={eventDidMount}
            />
        </div>
    );
};

export default CalEpl;
