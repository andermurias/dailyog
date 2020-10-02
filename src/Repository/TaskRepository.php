<?php

namespace App\Repository;

use App\Entity\Task;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @method Task|null find($id, $lockMode = null, $lockVersion = null)
 * @method Task|null findOneBy(array $criteria, array $orderBy = null)
 * @method Task[]    findAll()
 * @method Task[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class TaskRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Task::class);
    }

    /**
     * @return Task[] Returns an array of Task objects
     */
    public function finByUserAndDate(UserInterface $user, ?\DateTimeInterface $dateTime)
    {
        $queryBuilder = $this->createQueryBuilder('t')
            ->andWhere('t.user = :user')
            ->setParameter('user', $user->getId());
        if (is_null($dateTime)) {
            $queryBuilder
                ->andWhere('date(t.date) IS NULL');
        } else {
            $queryBuilder
                ->andWhere('date(t.date) = :date')
                ->setParameter('date', $dateTime->format('Y-m-d'));
        }
        $queryBuilder
            ->addOrderBy('t.start', 'ASC')
            ->addOrderBy('t.id', 'ASC');

        return $queryBuilder->getQuery()->getResult();
    }

    private function searchQueryByDescription(UserInterface $user, string $search)
    {
        return $this->createQueryBuilder('t')
            ->andWhere('MATCH_AGAINST(t.description) AGAINST(:searchterm boolean) > 0')
            ->setParameter('searchterm', $search)
            ->andWhere('t.user = :user')
            ->setParameter('user', $user->getId())
            ->addOrderBy('t.date', 'DESC')
            ->addOrderBy('t.start', 'DESC')
            ->andWhere('date(t.date) IS NOT NULL');
    }

    public function searchByDescription(UserInterface $user, string $search, int $page, int $results = 30)
    {
        $queryBuilder = $this->searchQueryByDescription($user, $search)
            ->setMaxResults($results)
            ->setFirstResult(($page - 1) * $results);

        return $queryBuilder->getQuery()->getResult();
    }

    public function searchByDescriptionCount(UserInterface $user, string $search)
    {
        return $this
            ->searchQueryByDescription($user, $search)
            ->select('count(t.id)')
            ->getQuery()
            ->getSingleScalarResult();
    }
}
