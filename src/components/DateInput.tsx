// src/components/DateInput.tsx
import DatePicker from 'react-datepicker';
import { InputGroup, FormControl } from 'react-bootstrap';
import { FaCalendarAlt } from 'react-icons/fa';
import "react-datepicker/dist/react-datepicker.css";


interface Props {
  startDate: Date | null;
  endDate: Date | null;
  setRange: (range: [Date | null, Date | null]) => void;
}

export default function DateInput({ startDate, endDate, setRange }: Props) {
  return (
    <InputGroup style={{ maxWidth: 250 }}>
      <InputGroup.Text>
        <FaCalendarAlt />
      </InputGroup.Text>
      <DatePicker
        selected={startDate}
        onChange={dates => {
          const [start, end] = dates as [Date, Date];
          setRange([start, end]);
        }}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        isClearable
        placeholderText="Sélectionnez une plage"
        customInput={<FormControl />}
        dateFormat="yyyy-MM-dd"
      />
    </InputGroup>
  );
}
