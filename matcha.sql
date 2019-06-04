-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jun 03, 2019 at 11:36 PM
-- Server version: 5.7.26-0ubuntu0.16.04.1
-- PHP Version: 7.0.33-0ubuntu0.16.04.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `matcha`
--

-- --------------------------------------------------------

--
-- Table structure for table `blocked`
--

CREATE TABLE `blocked` (
  `id` int(11) NOT NULL,
  `blocker` int(11) NOT NULL,
  `blocked` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `chat`
--

CREATE TABLE `chat` (
  `id` int(11) NOT NULL,
  `id_conversation` int(11) NOT NULL,
  `id_from` int(11) NOT NULL,
  `message` varchar(2048) NOT NULL,
  `created_at` datetime NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `id_conversation` int(11) NOT NULL,
  `id_user1` int(11) NOT NULL,
  `id_user2` int(11) NOT NULL,
  `last_update` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `history`
--

CREATE TABLE `history` (
  `id` int(11) NOT NULL,
  `visitor` int(11) NOT NULL,
  `visited` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `history`
--

INSERT INTO `history` (`id`, `visitor`, `visited`, `created_at`) VALUES
(158, 270, 271, '2019-05-28 01:57:49'),
(159, 270, 272, '2019-05-28 01:57:56'),
(160, 270, 273, '2019-05-28 01:58:02'),
(161, 270, 274, '2019-05-28 01:58:08'),
(162, 274, 270, '2019-05-28 02:11:57'),
(163, 270, 274, '2019-05-28 02:12:52'),
(164, 274, 270, '2019-05-28 02:13:16'),
(165, 270, 274, '2019-05-28 02:13:42'),
(166, 270, 274, '2019-05-28 02:14:00'),
(167, 270, 274, '2019-05-28 02:15:04'),
(168, 271, 272, '2019-05-28 04:47:25'),
(169, 270, 271, '2019-05-28 21:51:39'),
(170, 270, 277, '2019-05-28 21:52:16'),
(171, 309, 271, '2019-05-29 06:40:01'),
(172, 309, 272, '2019-05-29 06:40:32'),
(173, 309, 271, '2019-05-29 06:40:36'),
(174, 309, 271, '2019-05-29 06:40:53'),
(175, 309, 272, '2019-05-29 06:41:01'),
(176, 309, 273, '2019-05-29 06:41:08'),
(177, 309, 273, '2019-05-29 06:41:13'),
(178, 309, 273, '2019-05-29 06:41:36'),
(179, 309, 273, '2019-05-29 06:41:40'),
(180, 309, 273, '2019-05-29 06:41:48'),
(181, 309, 273, '2019-05-29 06:41:50'),
(182, 309, 273, '2019-05-29 06:42:18'),
(183, 309, 273, '2019-05-29 06:42:26'),
(184, 312, 313, '2019-05-31 23:48:49'),
(185, 312, 313, '2019-06-01 00:01:34'),
(186, 313, 312, '2019-06-01 00:01:48'),
(187, 312, 313, '2019-06-01 00:01:57'),
(188, 313, 312, '2019-06-01 00:04:45'),
(189, 312, 313, '2019-06-01 00:42:51'),
(190, 314, 312, '2019-06-01 01:13:22'),
(191, 312, 314, '2019-06-01 01:13:29'),
(192, 314, 312, '2019-06-01 01:14:06'),
(193, 312, 314, '2019-06-01 02:03:03'),
(194, 313, 312, '2019-06-01 02:48:32'),
(195, 312, 313, '2019-06-01 02:48:43'),
(196, 312, 313, '2019-06-01 04:40:05'),
(197, 312, 313, '2019-06-01 07:05:25'),
(198, 313, 312, '2019-06-01 23:36:24'),
(199, 313, 312, '2019-06-01 23:36:30'),
(200, 312, 313, '2019-06-01 23:37:11'),
(201, 312, 313, '2019-06-01 23:50:18'),
(202, 313, 312, '2019-06-01 23:56:28'),
(203, 312, 313, '2019-06-02 00:00:55'),
(204, 313, 312, '2019-06-02 00:01:03'),
(205, 313, 312, '2019-06-02 00:01:08'),
(206, 312, 313, '2019-06-02 03:38:21'),
(207, 313, 312, '2019-06-02 03:38:56'),
(208, 313, 312, '2019-06-02 04:30:39'),
(209, 313, 312, '2019-06-02 04:33:07'),
(210, 313, 312, '2019-06-02 04:37:21'),
(211, 313, 312, '2019-06-02 04:37:51'),
(212, 313, 312, '2019-06-02 04:40:41'),
(213, 313, 312, '2019-06-02 04:40:51'),
(214, 313, 312, '2019-06-02 04:41:05'),
(215, 313, 312, '2019-06-02 04:41:21'),
(216, 313, 312, '2019-06-02 04:42:43'),
(217, 313, 312, '2019-06-02 04:43:03'),
(218, 313, 312, '2019-06-02 04:46:26'),
(219, 313, 312, '2019-06-02 04:47:10'),
(220, 313, 312, '2019-06-02 04:48:02'),
(221, 313, 312, '2019-06-02 04:49:58'),
(222, 313, 312, '2019-06-02 04:51:15'),
(223, 313, 312, '2019-06-02 05:00:19'),
(224, 313, 312, '2019-06-02 05:01:55'),
(225, 313, 312, '2019-06-02 05:02:05'),
(226, 312, 313, '2019-06-02 05:23:07'),
(227, 313, 312, '2019-06-02 05:24:02'),
(228, 312, 313, '2019-06-02 05:24:10'),
(229, 313, 312, '2019-06-02 05:26:16'),
(230, 312, 313, '2019-06-02 05:26:17'),
(231, 313, 312, '2019-06-02 05:26:56'),
(232, 313, 312, '2019-06-02 05:28:47'),
(233, 312, 313, '2019-06-02 05:28:48'),
(234, 313, 312, '2019-06-02 05:29:05'),
(235, 312, 313, '2019-06-02 05:29:07'),
(236, 313, 312, '2019-06-02 05:29:31'),
(237, 312, 313, '2019-06-02 05:29:32'),
(238, 313, 312, '2019-06-02 05:29:38'),
(239, 312, 313, '2019-06-02 05:29:39'),
(240, 313, 312, '2019-06-02 05:30:03'),
(241, 312, 313, '2019-06-02 05:30:04'),
(242, 312, 313, '2019-06-02 05:30:06'),
(243, 313, 312, '2019-06-02 05:30:29'),
(244, 312, 313, '2019-06-02 05:30:29'),
(245, 313, 312, '2019-06-02 05:31:00'),
(246, 312, 313, '2019-06-02 05:31:01'),
(247, 312, 313, '2019-06-02 05:31:14'),
(248, 313, 312, '2019-06-02 05:31:22'),
(249, 312, 313, '2019-06-02 05:31:23'),
(250, 313, 312, '2019-06-02 05:31:30'),
(251, 312, 313, '2019-06-02 05:31:30'),
(252, 313, 312, '2019-06-02 05:31:46'),
(253, 312, 313, '2019-06-02 05:31:47'),
(254, 312, 313, '2019-06-02 05:33:14'),
(255, 313, 312, '2019-06-02 05:35:28'),
(256, 312, 313, '2019-06-02 05:35:28'),
(257, 313, 312, '2019-06-02 05:35:38'),
(258, 312, 313, '2019-06-02 05:35:40'),
(259, 313, 312, '2019-06-02 05:36:30'),
(260, 312, 313, '2019-06-02 05:36:30'),
(261, 313, 312, '2019-06-02 05:37:53'),
(262, 312, 313, '2019-06-02 05:37:54'),
(263, 313, 312, '2019-06-02 05:38:39'),
(264, 312, 313, '2019-06-02 05:38:39'),
(265, 313, 312, '2019-06-02 05:38:50'),
(266, 312, 313, '2019-06-02 05:38:51'),
(267, 313, 312, '2019-06-02 05:39:09'),
(268, 312, 313, '2019-06-02 05:39:09'),
(269, 313, 312, '2019-06-02 05:39:16'),
(270, 312, 313, '2019-06-02 05:39:17'),
(271, 313, 312, '2019-06-02 05:39:22'),
(272, 312, 313, '2019-06-02 05:39:23'),
(273, 313, 312, '2019-06-02 05:39:30'),
(274, 312, 313, '2019-06-02 05:39:30'),
(275, 313, 312, '2019-06-02 05:40:30'),
(276, 312, 313, '2019-06-02 05:40:30'),
(277, 312, 313, '2019-06-02 05:40:55'),
(278, 313, 312, '2019-06-02 05:40:56'),
(279, 313, 312, '2019-06-02 07:17:20'),
(280, 313, 314, '2019-06-02 07:18:15'),
(281, 313, 312, '2019-06-02 07:28:30'),
(282, 333, 313, '2019-06-02 08:02:48'),
(283, 333, 313, '2019-06-02 08:03:03'),
(284, 333, 313, '2019-06-02 08:03:37'),
(285, 333, 333, '2019-06-02 08:04:18'),
(286, 333, 333, '2019-06-02 08:04:43'),
(287, 333, 312, '2019-06-02 08:05:48'),
(288, 333, 316, '2019-06-02 08:06:09'),
(289, 333, 323, '2019-06-02 08:06:51'),
(290, 312, 333, '2019-06-03 00:28:48'),
(291, 312, 313, '2019-06-03 00:30:08'),
(292, 555, 313, '2019-06-03 04:16:30'),
(293, 555, 313, '2019-06-03 04:22:45'),
(294, 555, 313, '2019-06-03 04:23:13'),
(295, 312, 314, '2019-06-03 05:14:18'),
(296, 312, 313, '2019-06-03 05:14:30'),
(297, 555, 313, '2019-06-03 05:19:13'),
(298, 312, 313, '2019-06-03 05:21:23'),
(299, 312, 313, '2019-06-03 05:23:01'),
(300, 555, 313, '2019-06-03 05:23:04'),
(301, 312, 313, '2019-06-03 05:25:55'),
(302, 312, 313, '2019-06-03 05:26:01'),
(303, 555, 313, '2019-06-03 05:34:24'),
(304, 555, 313, '2019-06-03 05:34:25'),
(305, 555, 313, '2019-06-03 05:34:26'),
(306, 312, 313, '2019-06-03 05:40:22'),
(307, 312, 313, '2019-06-03 05:41:55'),
(308, 312, 313, '2019-06-03 05:43:09'),
(309, 312, 313, '2019-06-03 05:43:18'),
(310, 312, 314, '2019-06-03 05:43:38'),
(311, 312, 313, '2019-06-03 05:43:42'),
(312, 333, 312, '2019-06-03 20:47:19'),
(313, 333, 313, '2019-06-03 21:56:41'),
(314, 333, 313, '2019-06-03 22:29:16'),
(315, 333, 314, '2019-06-03 22:30:28'),
(316, 333, 313, '2019-06-03 22:30:31'),
(317, 333, 313, '2019-06-03 22:32:06'),
(318, 333, 313, '2019-06-03 22:32:12'),
(319, 333, 313, '2019-06-03 22:33:56'),
(320, 333, 313, '2019-06-03 22:35:01'),
(321, 333, 313, '2019-06-03 22:35:10'),
(322, 333, 313, '2019-06-03 22:35:18'),
(323, 333, 314, '2019-06-03 22:36:12'),
(324, 333, 313, '2019-06-03 22:36:16'),
(325, 333, 315, '2019-06-03 22:41:54'),
(326, 333, 315, '2019-06-03 22:41:59'),
(327, 333, 314, '2019-06-03 22:46:23'),
(328, 333, 313, '2019-06-03 22:46:27'),
(329, 555, 313, '2019-06-03 23:17:26'),
(330, 312, 314, '2019-06-03 23:18:03'),
(331, 312, 314, '2019-06-03 23:19:10'),
(332, 318, 312, '2019-06-03 23:24:26'),
(333, 312, 318, '2019-06-03 23:24:37'),
(334, 318, 312, '2019-06-03 23:25:07'),
(335, 318, 312, '2019-06-03 23:27:41'),
(336, 318, 312, '2019-06-03 23:27:54'),
(337, 318, 312, '2019-06-03 23:29:00'),
(338, 318, 312, '2019-06-03 23:30:44'),
(339, 318, 312, '2019-06-03 23:32:33');

-- --------------------------------------------------------

--
-- Table structure for table `images`
--

CREATE TABLE `images` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `profile` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `images`
--

INSERT INTO `images` (`id`, `user_id`, `name`, `profile`, `created_at`) VALUES
(195, 270, 'https://randomuser.me/api/portraits/women/58.jpg', 0, '2019-05-28 01:52:00'),
(196, 271, 'https://randomuser.me/api/portraits/women/44.jpg', 1, '2019-05-28 01:52:00'),
(197, 272, 'https://randomuser.me/api/portraits/women/39.jpg', 1, '2019-05-28 01:52:00'),
(198, 273, 'https://randomuser.me/api/portraits/men/68.jpg', 1, '2019-05-28 01:52:00'),
(199, 274, 'https://randomuser.me/api/portraits/men/97.jpg', 1, '2019-05-28 01:52:00'),
(200, 275, 'https://randomuser.me/api/portraits/men/5.jpg', 1, '2019-05-28 01:52:00'),
(201, 276, 'https://randomuser.me/api/portraits/women/28.jpg', 1, '2019-05-28 01:52:01'),
(202, 277, 'https://randomuser.me/api/portraits/women/39.jpg', 1, '2019-05-28 01:52:01'),
(203, 278, 'https://randomuser.me/api/portraits/women/84.jpg', 1, '2019-05-28 01:52:01'),
(204, 279, 'https://randomuser.me/api/portraits/men/43.jpg', 1, '2019-05-28 01:52:01'),
(205, 280, 'https://randomuser.me/api/portraits/women/76.jpg', 1, '2019-05-28 01:52:01'),
(206, 281, 'https://randomuser.me/api/portraits/women/33.jpg', 1, '2019-05-28 01:52:01'),
(207, 282, 'https://randomuser.me/api/portraits/men/16.jpg', 1, '2019-05-28 01:52:01'),
(208, 283, 'https://randomuser.me/api/portraits/women/20.jpg', 1, '2019-05-28 01:52:02'),
(209, 284, 'https://randomuser.me/api/portraits/women/40.jpg', 1, '2019-05-28 01:52:02'),
(210, 285, 'https://randomuser.me/api/portraits/men/88.jpg', 1, '2019-05-28 01:52:02'),
(211, 286, 'https://randomuser.me/api/portraits/women/11.jpg', 1, '2019-05-28 01:52:02'),
(212, 287, 'https://randomuser.me/api/portraits/men/7.jpg', 1, '2019-05-28 01:52:02'),
(213, 288, 'https://randomuser.me/api/portraits/women/62.jpg', 1, '2019-05-28 01:52:02'),
(214, 289, 'https://randomuser.me/api/portraits/women/21.jpg', 1, '2019-05-28 01:52:02'),
(215, 290, 'https://randomuser.me/api/portraits/women/22.jpg', 1, '2019-05-28 01:52:02'),
(216, 291, 'https://randomuser.me/api/portraits/women/28.jpg', 1, '2019-05-28 01:52:02'),
(217, 292, 'https://randomuser.me/api/portraits/women/42.jpg', 1, '2019-05-28 01:52:02'),
(218, 293, 'https://randomuser.me/api/portraits/women/29.jpg', 1, '2019-05-28 01:52:02'),
(219, 294, 'https://randomuser.me/api/portraits/men/89.jpg', 1, '2019-05-28 01:52:03'),
(220, 295, 'https://randomuser.me/api/portraits/women/30.jpg', 1, '2019-05-28 01:52:03'),
(221, 296, 'https://randomuser.me/api/portraits/men/27.jpg', 1, '2019-05-28 01:52:03'),
(222, 297, 'https://randomuser.me/api/portraits/men/52.jpg', 1, '2019-05-28 01:52:03'),
(223, 298, 'https://randomuser.me/api/portraits/men/38.jpg', 1, '2019-05-28 01:52:03'),
(224, 299, 'https://randomuser.me/api/portraits/women/34.jpg', 1, '2019-05-28 01:52:03'),
(225, 300, 'https://randomuser.me/api/portraits/women/52.jpg', 1, '2019-05-28 01:52:04'),
(226, 301, 'https://randomuser.me/api/portraits/men/54.jpg', 1, '2019-05-28 01:52:04'),
(227, 302, 'https://randomuser.me/api/portraits/men/80.jpg', 1, '2019-05-28 01:52:04'),
(228, 303, 'https://randomuser.me/api/portraits/men/84.jpg', 1, '2019-05-28 01:52:04'),
(229, 304, 'https://randomuser.me/api/portraits/men/42.jpg', 1, '2019-05-28 01:52:04'),
(230, 305, 'https://randomuser.me/api/portraits/women/72.jpg', 1, '2019-05-28 01:52:04'),
(231, 270, '270-f73093bf665917431020.png', 1, '2019-05-28 02:10:36'),
(232, 309, '309-f6c5d27ed1dc7b77cc25.png', 1, '2019-05-29 06:39:16'),
(233, 312, 'https://randomuser.me/api/portraits/men/67.jpg', 0, '2019-05-29 11:48:34'),
(234, 313, 'https://randomuser.me/api/portraits/women/53.jpg', 1, '2019-05-29 11:48:34'),
(235, 314, 'https://randomuser.me/api/portraits/men/76.jpg', 1, '2019-05-29 11:48:34'),
(236, 315, 'https://randomuser.me/api/portraits/men/44.jpg', 1, '2019-05-29 11:48:34'),
(237, 316, 'https://randomuser.me/api/portraits/women/8.jpg', 1, '2019-05-29 11:48:34'),
(238, 317, 'https://randomuser.me/api/portraits/women/18.jpg', 1, '2019-05-29 11:48:34'),
(239, 318, 'https://randomuser.me/api/portraits/men/19.jpg', 1, '2019-05-29 11:48:34'),
(240, 319, 'https://randomuser.me/api/portraits/men/17.jpg', 1, '2019-05-29 11:48:34'),
(241, 320, 'https://randomuser.me/api/portraits/women/74.jpg', 1, '2019-05-29 11:48:34'),
(242, 321, 'https://randomuser.me/api/portraits/men/82.jpg', 1, '2019-05-29 11:48:34'),
(243, 322, 'https://randomuser.me/api/portraits/men/72.jpg', 1, '2019-05-29 11:48:34'),
(244, 323, 'https://randomuser.me/api/portraits/women/55.jpg', 1, '2019-05-29 11:48:34'),
(245, 312, '312-3382d6416e2e72a2cf03.png', 1, '2019-06-02 00:00:47'),
(246, 333, '333-87da4accddb0a3544501.png', 0, '2019-06-02 07:56:53'),
(247, 333, '333-df2f0d39c7b00fecfa30.png', 0, '2019-06-02 07:57:59'),
(248, 333, '333-505e0c38ebf7cabf1d18.png', 0, '2019-06-02 07:58:49'),
(249, 333, '333-1601107b2ad0337fae47.png', 0, '2019-06-02 08:01:24'),
(250, 333, '333-f57d6d68ebd46b6a1c8d.png', 1, '2019-06-02 08:01:41');

-- --------------------------------------------------------

--
-- Table structure for table `matches`
--

CREATE TABLE `matches` (
  `id` int(11) NOT NULL,
  `matcher` int(11) NOT NULL,
  `matched` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `matches`
--

INSERT INTO `matches` (`id`, `matcher`, `matched`, `created_at`) VALUES
(72, 270, 271, '2019-05-28 01:57:50'),
(73, 270, 272, '2019-05-28 01:57:58'),
(74, 270, 273, '2019-05-28 01:58:03'),
(76, 274, 270, '2019-05-28 02:12:48'),
(77, 270, 274, '2019-05-28 02:14:06'),
(78, 271, 272, '2019-05-28 04:47:53'),
(81, 313, 312, '2019-06-01 00:01:50'),
(82, 314, 312, '2019-06-01 01:13:23'),
(83, 312, 314, '2019-06-01 01:13:30'),
(84, 333, 313, '2019-06-02 08:03:39'),
(90, 312, 313, '2019-06-03 05:43:20'),
(92, 318, 312, '2019-06-03 23:24:28'),
(93, 312, 318, '2019-06-03 23:24:38');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `type` int(11) NOT NULL,
  `id_from` int(11) NOT NULL,
  `id_to` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `value` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `gender` varchar(20) DEFAULT NULL,
  `looking` varchar(20) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `biography` text,
  `tags` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `postal_code` varchar(50) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `rating` double NOT NULL DEFAULT '0',
  `lat` varchar(30) NOT NULL DEFAULT '0',
  `lng` varchar(30) NOT NULL DEFAULT '0',
  `vkey` varchar(255) NOT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `token` varchar(255) DEFAULT NULL,
  `tokenExpiration` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `username`, `email`, `password`, `created_at`, `gender`, `looking`, `birthdate`, `biography`, `tags`, `address`, `city`, `country`, `postal_code`, `phone`, `status`, `rating`, `lat`, `lng`, `vkey`, `verified`, `token`, `tokenExpiration`) VALUES
(310, 'marilou', 'gauthier', 'goldenzebra678', 'marilou.gauthier@example.com', '$2a$10$egmZhswdWfpJ5FLd0wdhUeYl3CQmAASM1i4HKDIu6C2voC2aV1aa.', '2019-05-29 11:41:34', 'female', 'male', '1994-11-06', '', '', '4746 rue pasteur', 'fort-de-france', 'france', '90198', '06-87-96-39-06', NULL, 0.9534603641851747, '-5.1590', '48.3734', 'b40701c715e2a27f1167', 1, NULL, NULL),
(311, 'pedro', 'dominguez', 'angrymouse493', 'pedro.dominguez@example.com', '$2a$10$oMD5kQqfGyZoTWyHKfhZKuvziVPDIaLCZEx9A6X/m5f05g2IikT1.', '2019-05-29 11:41:34', 'male', 'female', '1963-01-25', '', '', '5966 calle de pedro bosch', 'murcia', 'spain', '23235', '696-502-697', NULL, 2.928734766400968, '-73.4638', '-162.6641', '4075fd2c2d44e8e02181', 1, NULL, NULL),
(312, 'oscar', 'edwards', 'greenlion015', 'oscar.edwards@example.com', '$2a$10$fb3cxeK8v0xsQsRMgHb41emjG1ZkQOrKkoE.kSGi3jo/qAUP8gk2i', '2019-05-29 11:48:33', 'male', 'female', '1987-09-01', '', '', '6877 tremaine avenue', 'blenheim', 'new zealand', '52070', '(117)-536-8275', NULL, 1.5608071989398598, '32.882051', '-6.897697', '4c1a306455a78f98d8f2', 1, '2c5fbf0cbdc1fd1d90c3', '2019-06-04 01:34:13'),
(313, 'june', 'oliver', 'blackostrich754', 'june.oliver@example.com', '$2a$10$94SB4C6aM2g6Wtv3MOKdfuYzUYeL0/uCbj.iUgOU5NbxKq4F6p1w.', '2019-05-29 11:48:34', 'female', 'male', '1953-01-23', '', '', '2638 e center st', 'sydney', 'australia', '7934', '0437-683-197', NULL, 1.5424872050006733, '32.8811', '-6.9063', 'dac8387a63e22e139705', 1, 'b50148d61c67cc8d3b19', '2019-06-04 01:34:53'),
(314, 'elliot', 'roy', 'heavybird163', 'elliot.roy@example.com', '$2a$10$TPV4m15ESK61eV2Jnehvfe/g./dlbws.TRCQE4uhWixfpQrPp0Mo2', '2019-05-29 11:48:34', 'male', 'female', '1974-12-01', '', '', '6308 parliament st', 'south river', 'canada', 'Q9A 3U6', '541-665-9968', NULL, 0.5510640823066892, '32.882101299999995', '-6.8977067', '8993b8fe3885a0337ac3', 1, '523676bd3536fe715087', '2019-06-01 04:44:43'),
(315, 'alexander', 'møller', 'goldenrabbit812', 'alexander.møller@example.com', '$2a$10$tSmkRYXKKtJEfwHsVHaz0emQV74kpaBWTvivU6FdWdvn9jK9u06nC', '2019-05-29 11:48:34', 'male', 'female', '1992-05-14', '', '', '1124 østparken', 'randers nv', 'denmark', '57419', '45459813', NULL, 2.6107614287021175, '-64.5704', '-25.2178', '00a15668b94004cb0aba', 1, NULL, NULL),
(316, 'pippa', 'wood', 'brownrabbit563', 'pippa.wood@example.com', '$2a$10$BlDdVlJg63ls9IsgqMhdWuy/ANP/q2e3JjIWwvbGEnG0ZU0/vKhLG', '2019-05-29 11:48:34', 'female', 'male', '1995-03-19', '', '', '2859 rankin avenue', 'invercargill', 'new zealand', '18981', '(833)-762-8064', NULL, 3.996154267870431, '-84.6058', '-86.5774', 'b4c893dfa273a0114801', 1, '4e084ae0290954480816', '2019-06-01 03:12:09'),
(317, 'erika', 'young', 'greenlion752', 'erika.young@example.com', '$2a$10$7aipIrR8ThdrNGcn/299v.Rali4rVvTDRxHriFa5o7rvokUsdzTQi', '2019-05-29 11:48:34', 'female', 'male', '1953-08-07', '', '', '5607 poplar dr', 'bozeman', 'united states', '23347', '(427)-480-9893', NULL, 3.6555921707903236, '32.8811', '-6.9063', '7a5b23db22e4e6810d15', 1, '2daab084ca9ad27a58a0', '2019-06-04 01:34:13'),
(318, 'leon', 'jennings', 'blueleopard828', 'leon.jennings@example.com', '$2a$10$HfSTbV3DKG00LJkSBItzh.8jy59mQ80G9onqKAHXBuGEWoqsika6y', '2019-05-29 11:48:34', 'male', 'female', '1991-05-12', '', '', '4228 w 6th st', 'duncanville', 'united states', '84512', '(279)-152-4912', NULL, 3.9453612214168654, '32.8811', '-6.9063', '7431d9d0c474934485ec', 1, '9c05be44fe9b79a6ee9e', '2019-06-04 01:32:33'),
(319, 'eemil', 'hanka', 'angrypanda191', 'eemil.hanka@example.com', '$2a$10$Zlu7VOhYPGd0zkMz60wYWuPsUFGRiQGTNm6H5g1lUA3BICn2oU84G', '2019-05-29 11:48:34', 'male', 'female', '1947-03-09', '', '', '325 pirkankatu', 'pälkäne', 'finland', '70332', '042-200-80-35', NULL, 2.5949990515722665, '7.4511', '-6.1392', 'e0c3829fcbb4a195e575', 1, NULL, NULL),
(320, 'donata', 'freyer', 'organicostrich595', 'donata.freyer@example.com', '$2a$10$1o5iv4qgHBvUVMz1A2a2GeNcaXQEZpgYR0SdvoyC/uO1v3U51QStS', '2019-05-29 11:48:34', 'female', 'male', '1972-01-29', '', '', 'mühlenstraße 145', 'nordhorn', 'germany', '74255', '0171-8406778', NULL, 4.89194435222198, '-85.5424', '52.4999', '01a54fb10e8f12fcaf85', 1, NULL, NULL),
(321, 'sami', 'bertrand', 'ticklishbutterfly722', 'sami.bertrand@example.com', '$2a$10$CYhX.5NMFEfRXGzV7zd7y.VkUF/FJMyDgjduhwTQSszvruIJNymXW', '2019-05-29 11:48:34', 'male', 'female', '1982-07-07', '', '', '5479 rue victor-hugo', 'pompaples', 'switzerland', '6962', '(053)-634-4261', NULL, 0.012995298029105928, '-0.6681', '-164.4865', 'c44b6f8d8b90455137b5', 1, NULL, NULL),
(322, 'gordon', 'griffin', 'blackfish621', 'gordon.griffin@example.com', '$2a$10$O7N6xAW8gJ6vwi2tMs.MZ.Jy.ix.3qTfYEl0UMiwDrtRKbOzzs4hW', '2019-05-29 11:48:34', 'male', 'female', '1949-08-19', '', '', '517 park road', 'portsmouth', 'united kingdom', 'UR6 9DU', '0704-397-413', NULL, 2.168389311628822, '55.4728', '-48.1337', 'a4d04e2e9260b3011769', 1, NULL, NULL),
(323, 'norah', 'bourgeois', 'whitefrog637', 'norah.bourgeois@example.com', '$2a$10$Tfq43mIN5Y7Go/9ExPUoxOcZzIXNIMyBVpREy4B4C4xKEZRJWC4/W', '2019-05-29 11:48:34', 'female', 'male', '1968-09-27', '', '', '5431 avenue vauban', 'montpellier', 'france', '99781', '06-33-14-06-56', NULL, 1.298254835052015, '35.5448', '36.8369', 'd1186d0940e151d49a2d', 1, NULL, NULL),
(324, 'victoria', 'møller', 'lazyswan263', 'victoria.møller@example.com', '$2a$10$O64iI9/unMEsh0R7DW20q.o1V8NdGdJS5gITxC/oCO2K2ltJMUUs2', '2019-05-29 11:48:35', 'female', 'male', '1971-09-30', '', '', '8673 blåmejsevej', 'klitmøller', 'denmark', '31666', '98844088', NULL, 0.0259656742286829, '-83.9104', '21.5726', '66279693d86bbac234a5', 1, NULL, NULL),
(325, 'bruni', 'brede', 'beautifulbutterfly214', 'bruni.brede@example.com', '$2a$10$fk.ITiCLiIg/QWBtAEtZ..enSl9Iie/9ns0OSeWO/6bsRFn2bmFeq', '2019-05-29 11:48:35', 'female', 'male', '1973-10-20', '', '', 'waldstraße 27', 'sindelfingen', 'germany', '95470', '0178-8337768', NULL, 2.715763741678725, '18.1279', '126.0701', '26ef3ccb61ba02d3af13', 1, NULL, NULL),
(333, 'Yahya', 'Ez-zainabi', 'yez-zain', 'yezzainabi@gmail.com', '$2a$10$S79zaH9qU.CXu7IsWdkayOmAxxbAiDmeXm6DensjgQRoGYqhVPMcS', '2019-06-02 07:54:01', 'male', 'female', '1993-10-19', 'hey', '#dd #dddd,ddd,sdsdd,sdsdsd,sdsdsd ,dssd,sdsds,dd,d', '02 LOT HALIMA 2 QUARTIER ETTADAMOUNE', 'BERRECHID', 'Morocco', '26100', '0644179270', NULL, 0, '32.8811', '-6.9063', 'd6e41467edff12da9316', 1, '33662021fa35c4952c68', '2019-06-04 00:46:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `blocked`
--
ALTER TABLE `blocked`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chat`
--
ALTER TABLE `chat`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id_conversation`);

--
-- Indexes for table `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `images`
--
ALTER TABLE `images`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `matches`
--
ALTER TABLE `matches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `value` (`value`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `blocked`
--
ALTER TABLE `blocked`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;
--
-- AUTO_INCREMENT for table `chat`
--
ALTER TABLE `chat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id_conversation` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `history`
--
ALTER TABLE `history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=340;
--
-- AUTO_INCREMENT for table `images`
--
ALTER TABLE `images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=251;
--
-- AUTO_INCREMENT for table `matches`
--
ALTER TABLE `matches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;
--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=334;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
