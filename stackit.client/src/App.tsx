import { useState } from 'react';
import { Navbar, Container, Dropdown, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTranslation } from 'react-i18next';
import './i18n';
import SavingGoals from './components/SavingGoals';
import MonthlyBalance from './components/MonthlyBalance';
import GoalProgress from './components/GoalProgress';
import './App.css'; // o il percorso corretto del tuo file css

interface Balance {
    id?: number;
    month: string; // es. "2025-06"
    balance: number;
}

interface Goal {
    id?: number;
    label: string;
    amount: number;
    dueMonth: string;
    progression: number;
    remaining: number;
}

function App() {
    const { i18n } = useTranslation();  // t per tradurre, i18n per gestire la lingua

    // Funzione per cambiare lingua
    const changeLanguage = (lng: 'en' | 'it') => {
        i18n.changeLanguage(lng);
    };

    const flagIcons: Record<'en' | 'it', string> = {
        en: 'https://flagcdn.com/w40/gb.png',
        it: 'https://flagcdn.com/w40/it.png',
    };

    const rawLanguage = i18n.language;
    const currentLanguage = rawLanguage.split('-')[0] as 'en' | 'it';
    const [monthlyBalances, setMonthlyBalances] = useState<Balance[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);

    return (
        <div>
            <Navbar style={{ backgroundColor: '#f8f9fa' }} variant="light" expand="lg">
                <Container>
                    <Navbar.Brand href="#">Stackit</Navbar.Brand>

                    {/* Dropdown per la selezione della lingua */}
                    <Dropdown align="end" className="ms-auto me-3">
                        <Dropdown.Toggle variant="outline-light" id="dropdown-language">
                            <Image src={flagIcons[currentLanguage]} width="20" className="me-2" /> {/* Mostra la bandiera della lingua selezionata */}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => changeLanguage('en')}>
                                <Image src="https://flagcdn.com/w40/gb.png" width="20" className="me-2" />
                                English
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => changeLanguage('it')}>
                                <Image src="https://flagcdn.com/w40/it.png" width="20" className="me-2" />
                                Italiano
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Container>
            </Navbar>
            <SavingGoals
                goals={goals}
                setGoals={setGoals}
            />
            <MonthlyBalance
                balances={monthlyBalances}
                setBalances={setMonthlyBalances}
            />
            <GoalProgress balances={monthlyBalances} goalsUpdate={goals} />
        </div>
    );
}

export default App;
