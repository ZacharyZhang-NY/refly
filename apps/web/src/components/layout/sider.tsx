import { useState } from "react"
import {
  Avatar,
  Divider,
  Layout,
  Menu,
  Tag,
  Tooltip,
  Button,
} from "@arco-design/web-react"
import {
  useLocation,
  useNavigate,
} from "@refly-packages/ai-workspace-common/utils/router"
import {
  HiOutlineHome,
  HiOutlineDocumentAdd,
  HiOutlineBookOpen,
} from "react-icons/hi"
import { LuMoreHorizontal } from "react-icons/lu"
import { RiRobot2Line, RiHistoryLine } from "react-icons/ri"
import {
  AiOutlineMenuFold,
  AiOutlineMenuUnfold,
  AiFillChrome,
} from "react-icons/ai"

import {
  IconLanguage,
  IconImport,
  IconRight,
} from "@arco-design/web-react/icon"
// 静态资源
import Logo from "@/assets/logo.svg"
import "./sider.scss"
import { useUserStoreShallow } from "@refly-packages/ai-workspace-common/stores/user"
import { useNewCanvasModalStoreShallow } from "@/store/new-canvas-modal"
import { safeParseJSON } from "@refly-packages/ai-workspace-common/utils/parse"
// components
import { SearchQuickOpenBtn } from "@refly-packages/ai-workspace-common/components/search-quick-open-btn"
import { useTranslation } from "react-i18next"
import { openGetStartDocument } from "@refly-packages/ai-workspace-common/utils"
import { UILocaleList } from "@refly-packages/ai-workspace-common/components/ui-locale-list"
import { useImportResourceStore } from "@refly-packages/ai-workspace-common/stores/import-resource"
import { SiderMenuSettingList } from "@refly-packages/ai-workspace-common/components/sider-menu-setting-list"
import { SiderMenuMoreList } from "@refly-packages/ai-workspace-common/components/sider-menu-more-list"
// hooks
import { useKnowledgeBaseJumpNewPath } from "@refly-packages/ai-workspace-common/hooks/use-jump-new-path"

const Sider = Layout.Sider
const MenuItem = Menu.Item

const getNavSelectedKeys = (pathname = "") => {
  if (pathname.includes("digest")) {
    return "Digest"
  } else if (pathname.includes("settings")) {
    return "Settings"
  } else if (pathname.includes("feed")) {
    return "Feed"
  } else if (pathname.includes("thread")) {
    return "ThreadLibrary"
  } else if (pathname.includes("skill")) {
    return "Skill"
  } else if (pathname.includes("knowledge-base")) {
    return "Knowledge"
  }

  return "Home"
}

const SiderLogo = (props: {
  collapse: boolean
  navigate: (path: string) => void
  setCollapse: (collapse: boolean) => void
}) => {
  const { navigate, collapse, setCollapse } = props
  const { t } = useTranslation()
  return (
    <div className="logo-box">
      <div className="logo" onClick={() => navigate("/")}>
        <img src={Logo} alt="Refly" />
        {!collapse && (
          <>
            <span>Refly </span>
            <Tag color="#00968F" className="logo-beta" size="small">
              Beta
            </Tag>
          </>
        )}
      </div>
      {!collapse && (
        <div className="collapse-btn" onClick={() => setCollapse(true)}>
          <Tooltip
            position="right"
            content={t("loggedHomePage.siderMenu.collapse")}>
            <AiOutlineMenuFold
              className="arco-icon"
              style={{ fontSize: 20, color: "#666666" }}
            />
          </Tooltip>
        </div>
      )}
    </div>
  )
}

const MenuItemContent = (props: {
  icon?: React.ReactNode
  title?: string
  collapse?: boolean
  position?: "left" | "right"
}) => {
  const { position = "left" } = props
  return (
    <div className="flex">
      <div className="flex flex-1 flex-nowrap items-center">
        {position === "left" && props.icon}
        <span className="sider-menu-title">{props.title}</span>
        {position === "right" && props.icon}
      </div>
    </div>
  )
}

const MenuItemTooltipContent = (props: { title: string }) => {
  return <div>{props.title}</div>
}

const SettingItem = () => {
  const userStore = useUserStoreShallow(state => ({
    userProfile: state.userProfile,
  }))
  const { t } = useTranslation()
  return (
    <div className="w-full">
      <SiderMenuSettingList>
        <div className="flex flex-1 items-center justify-between">
          <div className="menu-settings user-profile">
            <Avatar size={32}>
              <img
                src={userStore?.userProfile?.avatar || ""}
                alt="user-avatar"
              />
            </Avatar>
            <span className="username">
              <span>{userStore?.userProfile?.nickname}</span>
            </span>
          </div>
          <div className="subscription-status">
            {t(
              `settings.subscription.subscriptionStatus.${userStore?.userProfile?.subscription?.planType || "free"}`,
            )}
          </div>
        </div>
      </SiderMenuSettingList>
    </div>
  )
}

const MoreInfo = (props: { collapse: boolean }) => {
  const { t } = useTranslation()
  const { collapse } = props
  return (
    <div className="more-info">
      {!collapse && (
        <Tooltip content={t("loggedHomePage.siderMenu.downloadExtension")}>
          <Button
            className="more-info-btn"
            icon={<AiFillChrome style={{ fontSize: 16 }} />}
            onClick={() => {
              window.open(
                `https://chromewebstore.google.com/detail/lecbjbapfkinmikhadakbclblnemmjpd`,
                "_blank",
              )
            }}>
            {t("loggedHomePage.siderMenu.download")}
          </Button>
        </Tooltip>
      )}
      <div className="flex items-center">
        {!collapse && (
          <UILocaleList>
            <Button className="more-info-btn" iconOnly>
              <IconLanguage style={{ fontSize: 18, marginRight: 0 }} />
            </Button>
          </UILocaleList>
        )}
        <SiderMenuMoreList>
          <Button
            className="more-info-btn"
            iconOnly
            icon={
              <LuMoreHorizontal
                style={{ fontSize: 18, marginLeft: collapse ? "-24px" : 0 }}
              />
            }></Button>
        </SiderMenuMoreList>
      </div>
    </div>
  )
}

export const SiderLayout = () => {
  const [collapse, setCollapse] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const userStore = useUserStoreShallow(state => ({
    userProfile: state.userProfile,
    loginModalVisible: state.loginModalVisible,
    setLoginModalVisible: state.setLoginModalVisible,
  }))
  const importResourceStore = useImportResourceStore(state => ({
    setImportResourceModalVisible: state.setImportResourceModalVisible,
    setSelectedMenuItem: state.setSelectedMenuItem,
  }))
  const newCanvasModalStore = useNewCanvasModalStoreShallow(state => ({
    setNewCanvasModalVisible: state.setNewCanvasModalVisible,
  }))
  const isGuideDetail = location.pathname.includes("guide/")

  const { jumpToProject, jumpToConv } = useKnowledgeBaseJumpNewPath()

  const { t } = useTranslation()

  // 获取 storage user profile
  const storageUserProfile = safeParseJSON(
    localStorage.getItem("refly-user-profile"),
  )
  const notShowLoginBtn = storageUserProfile?.uid || userStore?.userProfile?.uid

  const selectedKey = getNavSelectedKeys(location.pathname)
  const handleNavClick = (itemKey: string) => {
    switch (itemKey) {
      case "Home": {
        if (!notShowLoginBtn) {
          userStore.setLoginModalVisible(true)
        } else {
          navigate(`/`)
        }
        break
      }

      case "Explore": {
        if (!notShowLoginBtn) {
          userStore.setLoginModalVisible(true)
        } else {
          navigate(`/explore`)
        }
        break
      }

      case "Settings": {
        break
      }

      case "Feed": {
        if (!notShowLoginBtn) {
          userStore.setLoginModalVisible(true)
        } else {
          navigate(`/feed`)
        }
        break
      }

      case "Digest": {
        if (!notShowLoginBtn) {
          userStore.setLoginModalVisible(true)
        } else {
          navigate(`/digest`)
        }
        break
      }

      case "Collection": {
        navigate(`/collection`)
        break
      }

      case "Notification": {
        navigate(`/notification`)
        break
      }

      case "Favorites": {
        navigate(`/favorites`)
        break
      }

      case "getStart": {
        openGetStartDocument()
        break
      }

      case "Skill": {
        navigate(`/skill`)
        break
      }

      case "Knowledge": {
        navigate(`/knowledge-base`)
        break
      }

      case "ThreadLibrary": {
        navigate(`/thread`)
        break
      }

      case "DownloadExtension": {
        // 下载浏览器插件
        window.open(
          `https://chromewebstore.google.com/detail/lecbjbapfkinmikhadakbclblnemmjpd`,
          "_blank",
        )
        break
      }

      case "Expand": {
        setCollapse(false)
        break
      }

      default: {
        break
      }
    }
  }

  interface SiderCenterProps {
    key: string
    name: string
    icon: React.ReactNode
    showDivider?: boolean
    onClick?: () => void
  }

  const siderSections: SiderCenterProps[][] = [
    [
      {
        key: "NewDraft",
        name: "newDraft",
        icon: (
          <HiOutlineDocumentAdd
            className="arco-icon"
            style={{ fontSize: 20 }}
          />
        ),
        showDivider: true,
        onClick: () => {
          newCanvasModalStore.setNewCanvasModalVisible(true)
        },
      },
      {
        key: "Import",
        name: "newResource",
        icon: <IconImport style={{ fontSize: 20 }} />,
        showDivider: true,
        onClick: () => {
          importResourceStore.setImportResourceModalVisible(true)
          importResourceStore.setSelectedMenuItem("import-from-weblink")
        },
      },
    ],
    [
      {
        key: "Home",
        name: "homePage",
        icon: <HiOutlineHome className="arco-icon" style={{ fontSize: 20 }} />,
      },
      {
        key: "Knowledge",
        name: "knowledgeBase",
        icon: (
          <HiOutlineBookOpen className="arco-icon" style={{ fontSize: 20 }} />
        ),
      },
      {
        key: "Skill",
        name: "skill",
        icon: <RiRobot2Line className="arco-icon" style={{ fontSize: 20 }} />,
      },
      {
        key: "ThreadLibrary",
        name: "threadLibrary",
        icon: <RiHistoryLine className="arco-icon" style={{ fontSize: 20 }} />,
      },
    ],
  ]

  const recentProjects = [
    // Add 7-8 recent projects here
    { key: "project1", name: "Project 1", projectId: "1" },
    { key: "project2", name: "Project 2", projectId: "2" },
    // ... more projects
  ]

  const recentChats = [
    // Add 7-8 recent chats here
    { key: "chat1", name: "Chat 1", projectId: "1", convId: "1" },
    { key: "chat2", name: "Chat 2", convId: "2" },
    // ... more chats
  ]

  return (
    <Sider
      className={`app-sider ${isGuideDetail ? "fixed" : ""}`}
      width={collapse ? 90 : 220}>
      <div
        className={`sider-header ${collapse ? "sider-header-collapse" : ""}`}>
        <SiderLogo
          navigate={path => navigate(path)}
          collapse={collapse}
          setCollapse={() => setCollapse(!collapse)}
        />

        <SearchQuickOpenBtn collapse={collapse} />

        <Menu
          style={{
            width: 220,
            backgroundColor: "transparent",
            borderRight: "none",
          }}
          collapse={collapse}
          defaultSelectedKeys={["Home"]}
          className="sider-menu-nav"
          selectedKeys={[selectedKey]}
          tooltipProps={{}}
          onClickMenuItem={handleNavClick}>
          <div className="sider-menu-inner">
            {siderSections.map((section, index) => (
              <div key={`section-${index}`} className="sider-section">
                {section.map(item => (
                  <MenuItem
                    key={item.key}
                    className="custom-menu-item"
                    renderItemInTooltip={() => (
                      <MenuItemTooltipContent
                        title={t(`loggedHomePage.siderMenu.${item.name}`)}
                      />
                    )}
                    onClick={item.onClick}>
                    <MenuItemContent
                      icon={item.icon}
                      title={t(`loggedHomePage.siderMenu.${item.name}`)}
                    />
                  </MenuItem>
                ))}
                {index < siderSections.length - 1 && (
                  <Divider style={{ margin: "8px 0" }} />
                )}
              </div>
            ))}

            <Divider style={{ margin: "8px 0" }} />

            <div className="recent-section">
              <div className="recent-projects">
                <h3>{t("loggedHomePage.siderMenu.recentProjects")}</h3>
                {recentProjects.map(project => (
                  <MenuItem
                    key={project.key}
                    onClick={() => {
                      jumpToProject({ projectId: project.projectId })
                    }}>
                    {project.name}
                  </MenuItem>
                ))}
                <MenuItem
                  key="viewMoreProjects"
                  onClick={() => {
                    /* Navigate to projects list */
                  }}>
                  <MenuItem
                    key="viewMoreChats"
                    onClick={() => {
                      /* Navigate to chats list */
                      navigate(`/knowledge-base?tab=project`)
                    }}>
                    <MenuItemContent
                      position="right"
                      icon={
                        <IconRight
                          className="arco-icon"
                          style={{ fontSize: 20 }}
                        />
                      }
                      title={t("loggedHomePage.siderMenu.viewMore")}
                    />
                  </MenuItem>
                </MenuItem>
              </div>

              <div className="recent-chats">
                <h3>{t("loggedHomePage.siderMenu.recentChats")}</h3>
                {recentChats.map(chat => (
                  <MenuItem
                    key={chat.key}
                    onClick={() => {
                      if (chat.projectId && chat.convId) {
                        jumpToConv({
                          projectId: chat.projectId,
                          convId: chat.convId,
                        })
                      } else if (chat.convId) {
                        jumpToConv({ convId: chat.convId })
                      }
                    }}>
                    {chat.name}
                  </MenuItem>
                ))}
                <MenuItem
                  key="viewMoreChats"
                  onClick={() => {
                    /* Navigate to chats list */
                    navigate(`/thread`)
                  }}>
                  <MenuItemContent
                    position="right"
                    icon={
                      <IconRight
                        className="arco-icon"
                        style={{ fontSize: 20 }}
                      />
                    }
                    title={t("loggedHomePage.siderMenu.viewMore")}
                  />
                </MenuItem>
              </div>
            </div>
          </div>

          <div className="sider-footer">
            {collapse && (
              <MenuItem
                key="Expand"
                className="custom-menu-item"
                renderItemInTooltip={() => (
                  <MenuItemTooltipContent
                    title={t("loggedHomePage.siderMenu.expand")}
                  />
                )}>
                <MenuItemContent
                  icon={
                    <AiOutlineMenuUnfold
                      className="arco-icon"
                      style={{ fontSize: 20 }}
                    />
                  }
                  title={t("loggedHomePage.siderMenu.expand")}
                />
              </MenuItem>
            )}

            {!!userStore.userProfile?.uid && (
              <MenuItem
                key="Settings"
                style={{ height: 40 }}
                className={`menu-setting-container setting-menu-item ${collapse ? "setting-menu-item-collapse" : ""}`}
                renderItemInTooltip={() => (
                  <MenuItemTooltipContent
                    title={t("loggedHomePage.siderMenu.settings")}
                  />
                )}>
                <SettingItem></SettingItem>
              </MenuItem>
            )}

            <Divider style={{ margin: "8px 0" }} />

            <MenuItem
              style={{ height: 40 }}
              key="MoreInfo"
              className={`${collapse ? "more-info-menu-item-collapse" : ""}`}
              renderItemInTooltip={() => null}>
              <MoreInfo collapse={collapse} />
            </MenuItem>
          </div>
        </Menu>
      </div>
    </Sider>
  )
}
