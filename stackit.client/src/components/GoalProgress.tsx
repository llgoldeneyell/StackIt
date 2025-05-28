import { useEffect, useState } from 'react';
import { ProgressBar, Card, ListGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface Goal {
    id?: number;
    label: string;
    amount: number;
    dueMonth: string;
    progression: number;
    remaining: number;
}

interface Balance {
    id?: number;
    month: string; // es. "2025-06"
    balance: number;
}

interface GoalProgressProps {
    balances: Balance[];
    goalsUpdate: Goal[];
}

function GoalProgress({ balances, goalsUpdate }: GoalProgressProps) {
    const { t } = useTranslation();

    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGoals = async (retries = 5, delayMs = 1000) => {
        try {
            setLoading(true);
            const response = await fetch('goalprogress');
            if (!response.ok) throw new Error('Errore nel caricamento obiettivi');

            const data: Goal[] = await response.json();
            setGoals(data);
            setLoading(false);
        } catch (err) {
            if (retries > 0) {
                console.warn(`Tentativo fallito, riprovo tra ${delayMs}ms... (${retries} tentativi rimasti)`);
                setTimeout(() => fetchGoals(retries - 1, delayMs * 2), delayMs);
            } else {
                setError((err as Error).message);
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchGoals();
    }, [balances, goalsUpdate]);

    if (loading) return <div>{t('loading')}</div>;
    if (error) return <div>{t('error')}: {error}</div>;

    return (
        <Card className="m-4">
            <Card.Header as="h5">{t('goalProgress')}</Card.Header>
            <ListGroup variant="flush">
                {goals.map(goal => {
                    const progress = parseFloat(goal.progression.toFixed(2)); // arrotonda a 2 decimali come numero

                    return (
                        <ListGroup.Item key={goal.id}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{goal.label}</strong> ({goal.amount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })})
                                </div>
                                <small>{progress}%</small>
                            </div>
                            <ProgressBar
                                now={progress}
                                label={`${progress}%`}
                                variant={progress >= 100 ? 'success' : 'info'}
                                className="mt-2"
                            />
                            {goal.remaining > 0 && (
                                <div className="text-muted small mt-1">
                                    {`${t('missing')}: ${goal.remaining.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}`}
                                </div>
                            )}
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>
        </Card>
    );
}

export default GoalProgress;
