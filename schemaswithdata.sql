--
-- PostgreSQL database dump
--

\restrict LbhjJQsc9SleLcEQc1zqpATc3LfAgIyUUBbmNMlbPr4Ht9281Iftx5nPsCTmlUM

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-30 19:32:45

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16680)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5117 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 223 (class 1259 OID 16846)
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    account_id integer NOT NULL,
    user_id integer NOT NULL,
    account_name character varying(100) NOT NULL,
    account_type character varying(50),
    current_balance numeric(12,2) DEFAULT 0,
    CONSTRAINT accounts_account_type_check CHECK (((account_type)::text = ANY ((ARRAY['Checking'::character varying, 'Savings'::character varying, 'Credit'::character varying, 'Investment'::character varying, 'Other'::character varying])::text[])))
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16845)
-- Name: accounts_account_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accounts_account_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accounts_account_id_seq OWNER TO postgres;

--
-- TOC entry 5118 (class 0 OID 0)
-- Dependencies: 222
-- Name: accounts_account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accounts_account_id_seq OWNED BY public.accounts.account_id;


--
-- TOC entry 229 (class 1259 OID 16902)
-- Name: bills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bills (
    bill_id integer NOT NULL,
    user_id integer NOT NULL,
    bill_name character varying(100) NOT NULL,
    amount numeric(12,2) NOT NULL,
    frequency character varying(50),
    next_due date
);


ALTER TABLE public.bills OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16901)
-- Name: bills_bill_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bills_bill_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bills_bill_id_seq OWNER TO postgres;

--
-- TOC entry 5119 (class 0 OID 0)
-- Dependencies: 228
-- Name: bills_bill_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bills_bill_id_seq OWNED BY public.bills.bill_id;


--
-- TOC entry 231 (class 1259 OID 16918)
-- Name: budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budgets (
    budget_id integer NOT NULL,
    user_id integer NOT NULL,
    category_id integer NOT NULL,
    amount_limit numeric(12,2) NOT NULL,
    budget_month integer,
    budget_year integer NOT NULL,
    CONSTRAINT budgets_budget_month_check CHECK (((budget_month >= 1) AND (budget_month <= 12)))
);


ALTER TABLE public.budgets OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16917)
-- Name: budgets_budget_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.budgets_budget_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.budgets_budget_id_seq OWNER TO postgres;

--
-- TOC entry 5120 (class 0 OID 0)
-- Dependencies: 230
-- Name: budgets_budget_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.budgets_budget_id_seq OWNED BY public.budgets.budget_id;


--
-- TOC entry 225 (class 1259 OID 16863)
-- Name: category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category (
    category_id integer NOT NULL,
    category_name character varying(100) NOT NULL,
    category_type character varying(50),
    CONSTRAINT category_category_type_check CHECK (((category_type)::text = ANY ((ARRAY['Income'::character varying, 'Expense'::character varying])::text[])))
);


ALTER TABLE public.category OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16862)
-- Name: category_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.category_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.category_category_id_seq OWNER TO postgres;

--
-- TOC entry 5121 (class 0 OID 0)
-- Dependencies: 224
-- Name: category_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.category_category_id_seq OWNED BY public.category.category_id;


--
-- TOC entry 227 (class 1259 OID 16873)
-- Name: transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transaction (
    transaction_id integer NOT NULL,
    user_id integer NOT NULL,
    account_id integer NOT NULL,
    category_id integer,
    transaction_date date NOT NULL,
    amount numeric(12,2) NOT NULL,
    description text
);


ALTER TABLE public.transaction OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16872)
-- Name: transaction_transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transaction_transaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transaction_transaction_id_seq OWNER TO postgres;

--
-- TOC entry 5122 (class 0 OID 0)
-- Dependencies: 226
-- Name: transaction_transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transaction_transaction_id_seq OWNED BY public.transaction.transaction_id;


--
-- TOC entry 221 (class 1259 OID 16831)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    created timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16830)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- TOC entry 5123 (class 0 OID 0)
-- Dependencies: 220
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 4921 (class 2604 OID 16849)
-- Name: accounts account_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts ALTER COLUMN account_id SET DEFAULT nextval('public.accounts_account_id_seq'::regclass);


--
-- TOC entry 4925 (class 2604 OID 16905)
-- Name: bills bill_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills ALTER COLUMN bill_id SET DEFAULT nextval('public.bills_bill_id_seq'::regclass);


--
-- TOC entry 4926 (class 2604 OID 16921)
-- Name: budgets budget_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets ALTER COLUMN budget_id SET DEFAULT nextval('public.budgets_budget_id_seq'::regclass);


--
-- TOC entry 4923 (class 2604 OID 16866)
-- Name: category category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category ALTER COLUMN category_id SET DEFAULT nextval('public.category_category_id_seq'::regclass);


--
-- TOC entry 4924 (class 2604 OID 16876)
-- Name: transaction transaction_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction ALTER COLUMN transaction_id SET DEFAULT nextval('public.transaction_transaction_id_seq'::regclass);


--
-- TOC entry 4919 (class 2604 OID 16834)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 5103 (class 0 OID 16846)
-- Dependencies: 223
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (account_id, user_id, account_name, account_type, current_balance) FROM stdin;
1	1	ASU Checking	Checking	2500.00
2	1	Main Savings	Savings	7500.00
3	2	WF Student	Checking	1200.00
4	2	Roboinhood	Investment	3000.00
5	3	Chase Total	Checking	4000.00
6	4	BofA Advantage	Checking	1500.00
\.


--
-- TOC entry 5109 (class 0 OID 16902)
-- Dependencies: 229
-- Data for Name: bills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bills (bill_id, user_id, bill_name, amount, frequency, next_due) FROM stdin;
1	1	Apartment Rent	850.00	Monthly	2025-12-01
2	1	Car Insurance	120.00	Monthly	2025-11-20
3	1	car Rent	50.00	Monthly	2025-12-01
\.


--
-- TOC entry 5111 (class 0 OID 16918)
-- Dependencies: 231
-- Data for Name: budgets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.budgets (budget_id, user_id, category_id, amount_limit, budget_month, budget_year) FROM stdin;
1	1	4	500.00	11	2025
2	1	5	850.00	11	2025
3	1	4	500.00	10	2025
4	1	5	850.00	10	2025
6	2	7	100.00	11	2025
7	2	8	150.00	11	2025
8	3	4	400.00	11	2025
9	3	9	200.00	11	2025
5	2	4	320.00	11	2025
\.


--
-- TOC entry 5105 (class 0 OID 16863)
-- Dependencies: 225
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.category (category_id, category_name, category_type) FROM stdin;
1	Salary	Income
2	Freelance	Income
3	Investment	Income
4	Food	Expense
5	Rent	Expense
6	Utilities	Expense
7	Transportation	Expense
8	Social	Expense
9	Shopping	Expense
10	Health	Expense
11	Other	Expense
\.


--
-- TOC entry 5107 (class 0 OID 16873)
-- Dependencies: 227
-- Data for Name: transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transaction (transaction_id, user_id, account_id, category_id, transaction_date, amount, description) FROM stdin;
2	1	1	5	2025-11-01	-850.00	Rent payment
3	1	1	6	2025-11-03	-75.50	Electric bill
4	1	1	4	2025-11-05	-120.00	Grocery shopping
5	1	1	8	2025-11-07	-45.20	Dinner with friends
6	1	1	7	2025-11-08	-30.00	Gas for car
7	1	1	1	2025-10-01	1800.00	Monthly paycheck
8	1	1	5	2025-10-01	-850.00	Rent payment
9	1	1	4	2025-10-06	-150.00	Grocery shopping
10	1	1	9	2025-10-10	-80.00	New shoes
11	1	1	8	2025-10-15	-60.00	Movie night
12	2	3	1	2025-11-01	1000.00	TA Stipend
13	2	3	4	2025-11-02	-25.00	Starbucks
14	2	3	7	2025-11-04	-40.00	Uber to airport
15	2	3	8	2025-11-06	-50.00	ASU Football game
16	3	5	2	2025-11-01	500.00	Web dev gig
17	3	5	9	2025-11-03	-180.00	New jacket
18	3	5	4	2025-11-05	-90.00	Costco run
19	4	6	1	2025-11-01	1300.00	On-campus job
20	4	6	10	2025-11-04	-20.00	CVS Prescription
21	2	3	4	2025-11-09	-45.99	Lunch with friends
22	2	3	5	2025-11-09	-55.99	Lunch with friends
\.


--
-- TOC entry 5101 (class 0 OID 16831)
-- Dependencies: 221
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, first_name, last_name, email, password, created) FROM stdin;
1	Santhosh	SRS	santhosh@example.com	$2a$06$wKZmvFr.nix/FKmOc0W8se65OS5DWZO0NGjlySfq99zFzYFCh7XF.	2025-11-08 22:36:29.338724
2	Kanav	Gupta	kanav@example.com	$2a$06$1ftLy9MQUHNDZv0S/cclG.C0YF50gBqP7iOpVe1qmTo.0Kh5pOznC	2025-11-08 22:36:29.338724
3	Vishvas	Singh	vishvas@example.com	$2a$06$ZwhXWoLUCdr5qedP4KZScuQj79zZgqtGVjZMGQq605V8g74Z5wLZa	2025-11-08 22:36:29.338724
4	Krishna	Balaji	krishna@example.com	$2a$06$fjjQ1uYIKG0uN7MloY39VeNJVx5ecI2ab5CzZ2Z3/n3HUOIfpITWy	2025-11-08 22:36:29.338724
\.


--
-- TOC entry 5124 (class 0 OID 0)
-- Dependencies: 222
-- Name: accounts_account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accounts_account_id_seq', 6, true);


--
-- TOC entry 5125 (class 0 OID 0)
-- Dependencies: 228
-- Name: bills_bill_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bills_bill_id_seq', 3, true);


--
-- TOC entry 5126 (class 0 OID 0)
-- Dependencies: 230
-- Name: budgets_budget_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.budgets_budget_id_seq', 9, true);


--
-- TOC entry 5127 (class 0 OID 0)
-- Dependencies: 224
-- Name: category_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.category_category_id_seq', 11, true);


--
-- TOC entry 5128 (class 0 OID 0)
-- Dependencies: 226
-- Name: transaction_transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transaction_transaction_id_seq', 22, true);


--
-- TOC entry 5129 (class 0 OID 0)
-- Dependencies: 220
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 4, true);


--
-- TOC entry 4935 (class 2606 OID 16856)
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (account_id);


--
-- TOC entry 4941 (class 2606 OID 16911)
-- Name: bills bills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_pkey PRIMARY KEY (bill_id);


--
-- TOC entry 4943 (class 2606 OID 16929)
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (budget_id);


--
-- TOC entry 4945 (class 2606 OID 16931)
-- Name: budgets budgets_user_id_category_id_budget_month_budget_year_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_user_id_category_id_budget_month_budget_year_key UNIQUE (user_id, category_id, budget_month, budget_year);


--
-- TOC entry 4937 (class 2606 OID 16871)
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (category_id);


--
-- TOC entry 4939 (class 2606 OID 16885)
-- Name: transaction transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_pkey PRIMARY KEY (transaction_id);


--
-- TOC entry 4931 (class 2606 OID 16844)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4933 (class 2606 OID 16842)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4946 (class 2606 OID 16857)
-- Name: accounts accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4950 (class 2606 OID 16912)
-- Name: bills bills_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4951 (class 2606 OID 16937)
-- Name: budgets budgets_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(category_id) ON DELETE CASCADE;


--
-- TOC entry 4952 (class 2606 OID 16932)
-- Name: budgets budgets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4947 (class 2606 OID 16891)
-- Name: transaction transaction_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(account_id) ON DELETE CASCADE;


--
-- TOC entry 4948 (class 2606 OID 16896)
-- Name: transaction transaction_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(category_id) ON DELETE SET NULL;


--
-- TOC entry 4949 (class 2606 OID 16886)
-- Name: transaction transaction_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


-- Completed on 2025-11-30 19:32:46

--
-- PostgreSQL database dump complete
--

\unrestrict LbhjJQsc9SleLcEQc1zqpATc3LfAgIyUUBbmNMlbPr4Ht9281Iftx5nPsCTmlUM

