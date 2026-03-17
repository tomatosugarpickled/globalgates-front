window.onload = () => {
    // 상담 받기 버튼
    const newChatBtn = document.querySelector(".ChatContent-Button");
    // 새 채팅방 div
    const newChatDiv = document.querySelector(".Chat-ChatContent");
    // 채팅방 div
    const chatDiv = document.querySelector(".ChatPage-Layout");
    // 채팅방 유저
    const chatUser = chatDiv.querySelector(".ChatPage-UserInfo");

    // 좌측의 채팅방이 있는 유저들
    const chats = document.querySelectorAll(".UserList-EachUser") || null;
    // 모달 백드롭
    const modalBackDrop = document.querySelector(".Modal-BackDrop");
    // 전문가 검색 모달
    const searchExpertModal = document.querySelector(".Search-Modal");
    // 상대방 정보 모달
    const userInfoModal = document.querySelector(".Big-Modal.Info");
    // 상대방 별명 변경 모달
    const changeAliasModal = document.querySelector(".Big-Modal.ChangeAlias");
    // 사라진 메세지 설정 모달
    const removedMsgModal = document.querySelector(".Big-Modal.RemovedMsg");
    // 모든 대화 지우기 모달
    const removeAllMsgModal = document.querySelector(".Small-Modal.RemoveAll");
    // 스크린샷 차단 설정 모달
    const banScreanShotModal = document.querySelector(
        ".Big-Modal.BanScreanShot",
    );
    // 전달 전용 검색 모달
    const postChatModal = document.querySelector(".Small-Modal.PostChat");
    // 특정 채팅 지우기 모달
    const deleteChatModal = document.querySelector(".Small-Modal.DeleteChat");
    // 채팅방 나가기 모달
    const leaveModal = document.querySelector(".Small-Modal.Leave");
    // 대화 차단 모달
    const banUserModal = document.querySelector(".Small-Modal.Ban-User");

    // 반응형 js -----------------------------------
    const userListWrapper = document.querySelector(".Chat-UserList-Wrapper");
    const backBtn = document.getElementById("chat-back-btn");
    const bottomNav = document.querySelector(".mobile-nav");

    // 좌측 검색바
    const searchBarPlaceholder = document.querySelector(
        ".Header-SearchBar:not(.Input)",
    );
    const searchBarInput = document.querySelector(".Header-SearchBar.Input");
    const searchInput = document.querySelector(".Search-Conversation-Input");
    const searchClearBtn = document.querySelector(".Search-Clear-Btn");
    const searchConvPanel = document.querySelector(".Search-Conversation");
    const searchConvEmpty = document.querySelector(".Search-Conv-Empty");
    const searchConvResults = document.querySelector(".Search-Conv-Results");
    const userListEl = document.querySelector(".UserList-Wrapper");

    // 모바일 여부 판단
    function isMobile() {
        return window.innerWidth <= 600;
    }

    // 채팅방 열기
    function openChatRoom() {
        newChatDiv.classList.add("off");
        chatDiv.classList.remove("off");
        bottomNav.style.display = "none";
        if (isMobile()) {
            userListWrapper.classList.add("off");
        }
    }

    // 채팅방 닫기
    function closeChatRoom() {
        chatDiv.classList.add("off");
        newChatDiv.classList.remove("off");
        bottomNav.style.display = "flex";
        if (isMobile()) {
            userListWrapper.classList.remove("off");
        }
    }

    backBtn.addEventListener("click", () => {
        closeChatRoom();
    });

    window.addEventListener("resize", () => {
        if (!isMobile()) {
            userListWrapper.classList.remove("off");
        } else {
            if (!chatDiv.classList.contains("off")) {
                userListWrapper.classList.add("off");
            }
        }
    });

    // 좌측 대화 검색 -----------------------------------
    function openSearchPanel() {
        searchBarPlaceholder.style.display = "none";
        searchBarInput.style.display = "flex";
        userListEl.style.display = "none";
        searchConvPanel.classList.remove("off");
        searchConvEmpty.style.display = "flex";
        searchConvResults.classList.add("off");
        setTimeout(() => searchInput.focus(), 50);
    }

    function closeSearchPanel() {
        searchBarPlaceholder.style.display = "";
        searchBarInput.style.display = "none";
        userListEl.style.display = "";
        searchConvPanel.classList.add("off");
        searchInput.value = "";
        searchClearBtn.classList.add("off");
    }

    searchBarPlaceholder.addEventListener("click", (e) => {
        e.stopPropagation();
        openSearchPanel();
    });

    searchInput.addEventListener("input", () => {
        const hasValue = searchInput.value.trim().length > 0;
        searchClearBtn.classList.toggle("off", !hasValue);
        searchConvEmpty.style.display = hasValue ? "none" : "flex";
        searchConvResults.classList.toggle("off", !hasValue);
    });

    searchClearBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchClearBtn.classList.add("off");
        searchConvEmpty.style.display = "flex";
        searchConvResults.classList.add("off");
        searchInput.focus();
    });

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeSearchPanel();
    });

    document.addEventListener("click", (e) => {
        if (
            !searchConvPanel.classList.contains("off") &&
            !searchBarInput.contains(e.target) &&
            !searchBarPlaceholder.contains(e.target) &&
            !searchConvPanel.contains(e.target)
        ) {
            closeSearchPanel();
        }
    });

    // -----------------------------------------------

    // EmojiButton 라이브러리가 로드된 경우에만 초기화
    let picker = null;
    const emoteButton = document.getElementById("emoji-btn");

    if (typeof EmojiButton !== "undefined") {
        picker = new EmojiButton({
            position: "top-start",
            zIndex: 9999,
        });
        picker.on("emoji", (emoji) => {
            const textBox = document.getElementById("chat-input");
            textBox.value += emoji;
            // 입력값 생기면 전송 버튼 활성화
            chatSubmit.classList.remove("off");
        });

        emoteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            picker.togglePicker(emoteButton);
        });
    } else {
        // 라이브러리가 없을 경우 버튼 숨김 처리
        if (emoteButton) emoteButton.style.display = "none";
    }

    const emojiPicker = document.querySelector(".Chat-Emoji-Picker");
    let activeEmoteBtn = null;

    function openEmojiPicker(btn) {
        emojiPicker.classList.remove("off");
        const rect = btn.getBoundingClientRect();
        const pickerWidth = emojiPicker.offsetWidth || 200;
        const pickerHeight = emojiPicker.offsetHeight || 50;

        let top = rect.top - pickerHeight - 8;
        let left = rect.left;

        if (top < 8) top = rect.bottom + 8;
        if (left + pickerWidth > window.innerWidth) {
            left = window.innerWidth - pickerWidth - 8;
        }
        if (left < 8) left = 8;

        emojiPicker.style.position = "fixed";
        emojiPicker.style.top = `${top}px`;
        emojiPicker.style.left = `${left}px`;
        emojiPicker.style.zIndex = "9999";
        activeEmoteBtn = btn;
    }

    function closeEmojiPicker() {
        emojiPicker.classList.add("off");
        activeEmoteBtn = null;
    }

    // 이모지 선택 이벤트
    emojiPicker.querySelectorAll(".Emoji-Button").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const emoji = btn.dataset.emoji;
            const targetChat = activeEmoteBtn?.closest(".Each-Main-Content");
            addReaction(emoji, targetChat);
            closeEmojiPicker();
        });
    });

    // 외부 클릭 시 이모지 피커 닫기
    document.addEventListener("click", (e) => {
        if (
            !emojiPicker.classList.contains("off") &&
            !emojiPicker.contains(e.target) &&
            e.target !== activeEmoteBtn
        ) {
            closeEmojiPicker();
        }
    });

    // -----------------------------------------------

    // 상담 받기 클릭시 전문가 검색창 표시
    function openSearchExpertModal() {
        openModal(searchExpertModal);

        const closeBtn = searchExpertModal.querySelector(
            ".Modal-Header-Button",
        );
        const searchInputModal = document.querySelector(
            ".Search-Modal-SearchBar input",
        );

        let timer;
        const delay = 1000;

        searchInputModal.addEventListener("keyup", (e) => {
            e.preventDefault();
            clearTimeout(timer);
            timer = setTimeout(() => {
                // REST API 요청 작성
            }, delay);
        });

        const experts = searchExpertModal.querySelectorAll(".Each-Expert");
        experts.forEach((expert) => {
            expert.addEventListener("click", (e) => {
                closeModal(searchExpertModal);
                openChatRoom();
            });
        });

        closeBtn.addEventListener("click", (e) => {
            closeModal(searchExpertModal);
        });
    }

    newChatBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openSearchExpertModal();
    });

    const inviteBtn = document.querySelector(".Header-Each-Button.Invite");
    if (inviteBtn) {
        inviteBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openSearchExpertModal();
        });
    }

    // 채팅방 이벤트 -----------------------------------
    if (chats) {
        chats.forEach((chat) => {
            chat.addEventListener("click", (e) => {
                chats.forEach((c) => c.classList.remove("current"));
                chat.classList.add("current");
                openChatRoom();
            });
        });
    }

    const buttons = chatDiv.querySelectorAll(".ChatPage-Button");
    buttons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const divName = button.classList[1];
            switch (divName) {
                case "VideoCall":
                    alert("추후 업데이트 예정입니다.");
                    break;
                case "UserInfo":
                    openModal(userInfoModal);
                    break;
            }
        });
    });

    const conversations = chatDiv.querySelectorAll(
        ".Left, .Right, .MyReply, .Reply",
    );
    const replyCons = chatDiv.querySelectorAll(".MyReply, .Reply");

    // 채팅 메뉴 관련
    const chatMenu = document.querySelector(".Chat-Extend-Menu");
    let activeBtn = null;

    function closeMenu() {
        if (activeBtn) {
            const menu = activeBtn.closest(".Message-Buttons");
            if (menu) menu.classList.add("off");
        }
        chatMenu.classList.remove("on");
        chatMenu.classList.add("off");
        activeBtn = null;
    }

    function updateMenuPosition() {
        if (!activeBtn) return;

        const rect = activeBtn.getBoundingClientRect();

        if (rect.top < 0 || rect.bottom > window.innerHeight) {
            closeMenu();
            return;
        }

        const menuHeight = chatMenu.offsetHeight;
        const menuWidth = chatMenu.offsetWidth;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceRight = window.innerWidth - rect.left;

        let top;
        if (spaceBelow >= menuHeight) {
            top = rect.bottom + 8;
        } else {
            top = rect.top - menuHeight - 8;
        }

        let left;
        if (spaceRight >= menuWidth) {
            left = rect.left;
        } else {
            left = rect.right - menuWidth;
        }
        left = Math.max(8, left);
        left = Math.min(left, window.innerWidth - menuWidth - 8);

        chatMenu.style.top = `${top}px`;
        chatMenu.style.left = `${left}px`;
    }

    conversations.forEach((c) => {
        const menu = c.querySelector(".Message-Buttons");
        if (!menu) return;

        const emojiBtn = menu.querySelector(".Message-Button.Emote");
        const moreBtn = menu.querySelector(".Message-Button.Menu");

        c.addEventListener("mouseover", () => {
            menu.classList.remove("off");
        });

        c.addEventListener(
            "touchstart",
            () => {
                menu.classList.remove("off");
            },
            { passive: true },
        );

        c.addEventListener("mouseleave", () => {
            // 이 채팅의 버튼이 activeBtn이거나 이모지 피커가 이 채팅에 연결된 경우 숨기지 않음
            if (activeBtn === moreBtn) return;
            if (
                activeEmoteBtn === emojiBtn &&
                !emojiPicker.classList.contains("off")
            )
                return;
            menu.classList.add("off");
        });

        if (emojiBtn) {
            emojiBtn.addEventListener("click", (e) => {
                e.stopPropagation();

                // 더보기 메뉴가 열려있으면 닫기
                if (chatMenu.classList.contains("on")) {
                    closeMenu();
                }

                // 같은 버튼 다시 클릭 시 닫기
                if (
                    activeEmoteBtn === emojiBtn &&
                    !emojiPicker.classList.contains("off")
                ) {
                    closeEmojiPicker();
                    return;
                }

                openEmojiPicker(emojiBtn);
            });
        }

        if (moreBtn) {
            moreBtn.addEventListener("click", (e) => {
                e.stopPropagation();

                // 이모지 피커가 열려있으면 닫기
                if (!emojiPicker.classList.contains("off")) {
                    closeEmojiPicker();
                }

                // 같은 버튼 다시 클릭 시 닫기
                if (
                    activeBtn === moreBtn &&
                    chatMenu.classList.contains("on")
                ) {
                    closeMenu();
                    return;
                }

                // 이전에 열린 메뉴의 Message-Buttons 숨기기
                if (activeBtn) {
                    const prevMenu = activeBtn.closest(".Message-Buttons");
                    if (prevMenu) prevMenu.classList.add("off");
                }

                menu.classList.remove("off");
                activeBtn = moreBtn;
                chatMenu.classList.remove("off");
                chatMenu.classList.add("on");
                updateMenuPosition();
            });
        }
    });

    const scrollContainer = document.querySelector(".ChatPage-Main-Container");
    if (scrollContainer) {
        scrollContainer.addEventListener(
            "scroll",
            () => {
                if (chatMenu.classList.contains("on")) {
                    updateMenuPosition();
                }
            },
            { passive: true },
        );
    }

    document.addEventListener("click", (e) => {
        // 채팅 더보기 메뉴 외부 클릭 시 닫기
        if (!chatMenu.contains(e.target)) {
            closeMenu();
        }
    });

    // 채팅 메뉴 이벤트
    const toast = document.querySelector(".Clipboard-Toast");

    // 답글 컨테이너
    const replyContainer = chatDiv.querySelector(".ChatPage-Reply-Container");
    const replyTextUser = replyContainer.querySelector(".Reply-Text-User");
    const replyTextContent = replyContainer.querySelector(
        ".Reply-Text-Content",
    );
    const replyCloseBtn = replyContainer.querySelector(".Reply-Close");

    function openReply(userName, content) {
        replyTextUser.textContent = userName;
        replyTextContent.textContent = content;
        replyContainer.classList.remove("off");
    }

    function closeReply() {
        replyContainer.classList.add("off");
        replyTextUser.textContent = "";
        replyTextContent.textContent = "";
    }

    replyCloseBtn.addEventListener("click", () => closeReply());

    const chatMenuBtns = chatMenu.querySelectorAll(".Extend-Menu-Button");
    chatMenuBtns.forEach((button) => {
        button.addEventListener("click", (e) => {
            const name = button.getAttribute("name");

            switch (name) {
                case "reply":
                    const targetChat = activeBtn?.closest(".Each-Main-Content");
                    const isLeft =
                        targetChat?.classList.contains("Left") ||
                        targetChat?.classList.contains("Reply");
                    const userName = isLeft
                        ? (chatDiv
                              .querySelector(
                                  ".ChatPage-UserInfo .UserName-Text",
                              )
                              ?.textContent.trim() ?? "상대방")
                        : "나";
                    const content =
                        targetChat
                            ?.querySelector(".Message-Content")
                            ?.textContent.trim() ?? "";
                    closeMenu(); // [FIX 1] 메뉴 먼저 닫기
                    openReply(userName, content);
                    break;
                case "trans":
                    closeMenu(); // [FIX 1] 메뉴 먼저 닫기
                    openModal(postChatModal);
                    break;
                case "copy":
                    const messageContent = activeBtn
                        ?.closest(".Each-Main-Content")
                        ?.querySelector(".Message-Content")?.innerText;
                    closeMenu(); // [FIX 1] 메뉴 먼저 닫기
                    if (!messageContent) break;
                    navigator.clipboard
                        .writeText(messageContent)
                        .then(() => {
                            toast.classList.remove("show");
                            void toast.offsetWidth;
                            toast.classList.add("show");
                            setTimeout(() => {
                                toast.classList.remove("show");
                            }, 4000);
                        })
                        .catch(() => {
                            console.error("클립보드 복사 실패");
                        });
                    break;
                case "delete":
                    closeMenu(); // [FIX 1] 메뉴 먼저 닫기
                    openModal(deleteChatModal);
                    break;
            }
        });
    });

    // 답변 채팅 클릭 시 해당 채팅으로 이동
    replyCons.forEach((reply) => {
        const replyWrapper = reply.querySelector(".MyReply-Wrapper");
        if (!replyWrapper) return;

        replyWrapper.addEventListener("click", (e) => {
            const targetId = reply.dataset.replyTo;
            if (!targetId) return;

            const targetLi = document.querySelector(
                `[data-chat-id="${targetId}"]`,
            );
            if (!targetLi) return;

            targetLi.scrollIntoView({ behavior: "smooth", block: "center" });

            setTimeout(() => {
                const messageContainer = targetLi.closest(".Each-Main-Content");
                if (!messageContainer) return;

                const isLeft = targetLi.classList.contains("Left");
                const animClass = isLeft ? "chat-pop-right" : "chat-pop-left";

                messageContainer.classList.remove(
                    "chat-pop-right",
                    "chat-pop-left",
                );
                void messageContainer.offsetWidth;
                messageContainer.classList.add(animClass);

                messageContainer.addEventListener(
                    "animationend",
                    () => {
                        messageContainer.classList.remove(animClass);
                    },
                    { once: true },
                );
            }, 400);
        });
    });

    // 하단 입력란 부분 -----------------------------------
    const chatInputDiv = document.querySelector(".Input-TextArea-Container");
    const chatForm = document.getElementById("chatSubmit");
    const chatInput = document.getElementById("chat-input");
    // [FIX 4] 이미지 첨부 관련 요소
    const chatAttach = document.getElementById("chat-image");
    const inputImageContainer = document.querySelector(
        ".Input-Image-Container",
    );
    const inputImageCard =
        inputImageContainer?.querySelector(".Input-Image-Card");
    const inputImageEl = inputImageCard?.querySelector("img");
    const removeImageBtn = inputImageCard?.querySelector(
        ".Remove-Image-Button",
    );
    const chatSubmit = document.querySelector(".Submit-Button-Wrapper");

    // 채팅 input 값 변화 시 전송 버튼 활성화
    chatInput.addEventListener("keyup", (e) => {
        if (chatInput.value) {
            chatSubmit.classList.remove("off");
        } else if (
            !inputImageContainer ||
            inputImageContainer.classList.contains("off")
        ) {
            // 이미지도 없고 텍스트도 없으면 버튼 비활성화
            chatSubmit.classList.add("off");
        }
    });

    if (chatAttach) {
        chatAttach.addEventListener("change", (e) => {
            const file = chatAttach.files[0];
            if (!file) return;

            // 이미지 파일만 허용
            if (!file.type.startsWith("image/")) {
                alert("이미지 파일만 첨부할 수 있습니다.");
                chatAttach.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onload = (ev) => {
                if (inputImageEl) {
                    inputImageEl.src = ev.target.result;
                }
                if (inputImageContainer) {
                    inputImageContainer.classList.remove("off");
                }
                // 이미지 첨부되면 전송 버튼 활성화
                chatSubmit.classList.remove("off");
            };
            reader.readAsDataURL(file);
        });
    }

    // [FIX 4] 이미지 제거 버튼
    if (removeImageBtn) {
        removeImageBtn.addEventListener("click", () => {
            if (inputImageEl) inputImageEl.src = "";
            if (inputImageContainer) inputImageContainer.classList.add("off");
            if (chatAttach) chatAttach.value = "";
            // 텍스트도 없으면 전송 버튼 비활성화
            if (!chatInput.value) {
                chatSubmit.classList.add("off");
            }
        });
    }

    // 채팅 보내기 이벤트
    chatSubmit.addEventListener("keyup", (e) => {
        e.preventDefault();
        if (e.key === "Enter") {
            chatForm.submit();
        }
    });
    chatSubmit.addEventListener("click", (e) => {
        e.preventDefault();
        chatForm.submit();
    });

    // 모달 이벤트 부분 -----------------------------------
    chatUser.addEventListener("click", (e) => {
        openModal(userInfoModal);
    });

    const userInfoClose = userInfoModal.querySelector(
        ".Big-Modal-Button.Close",
    );
    userInfoClose.addEventListener("click", (e) => {
        closeModal(userInfoModal);
    });

    userInfoModal.addEventListener("click", (e) => {
        let toggle = false;
        const btn = e.target.closest("button");
        const setting = e.target.closest(".Modal-Bottom-Setting");
        const upperBtn = e.target.closest(".Modal-Upper-Button");
        const menuBtns = userInfoModal.querySelectorAll(".Menu-Icon");

        if (btn?.classList.contains("Close")) return closeModal(userInfoModal);
        if (btn?.classList.contains("Alias"))
            return openModal(changeAliasModal);

        if (upperBtn) {
            if (upperBtn.classList.contains("Call"))
                return alert("추후 업데이트 예정입니다.");
            if (upperBtn.classList.contains("Profile")) return;
            if (upperBtn.classList.contains("More")) {
                userInfoModal
                    .querySelector(".Extend-Menu-Wrapper")
                    .classList.toggle("off");
                return;
            }
        }

        menuBtns.forEach((button) => {
            button.addEventListener("click", (e) => {
                const name = button.classList[1];
                switch (name) {
                    case "Mute":
                        toggle = !toggle;
                        const text = `
                        ${
                            toggle
                                ? `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" data-icon="icon-notifications-stroke" viewBox="0 0 24 24" width="1em" height="1em" display="flex" role="img" class="h-5 w-5"><path d="M19.993 9.042C19.48 5.017 16.054 2 11.996 2s-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958zM12 20c-1.306 0-2.417-.835-2.829-2h5.658c-.412 1.165-1.523 2-2.829 2zm-6.866-4l.847-6.698C6.364 6.272 8.941 4 11.996 4s5.627 2.268 6.013 5.295L18.864 16H5.134z"></path></svg>`
                                : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" data-icon="icon-notifications-off" viewBox="0 0 24 24" width="1em" height="1em" display="flex" role="img" class="h-5 w-5"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.375 17C16.375 19.2091 14.5841 21 12.375 21C10.1659 21 8.375 19.2091 8.375 17"></path><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.375 17H6.42522C5.21013 17 4.27578 15.9254 4.44462 14.7221L5.18254 9.46301C5.31208 8.25393 5.73464 7.14098 6.375 6.19173M9.375 3.65027C10.2917 3.23195 11.3086 3 12.375 3C16.0717 3 19.1736 5.78732 19.5675 9.46301L20.0536 14"></path><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.375 3L21.375 21"></path></svg>`
                        }
                            <div class="Menu-Text">
                            ${toggle ? "뮤트" : "언뮤트"}
                            </div>
                            `;
                        button.innerHTML = text;
                        break;
                    case "Delete":
                        userInfoModal
                            .querySelector(".Extend-Menu-Wrapper")
                            .classList.add("off");
                        openModal(leaveModal);
                        break;
                }
            });
        });

        if (setting) {
            const modalMap = {
                RemovedMsg: removedMsgModal,
                BanScreanShot: banScreanShotModal,
                BanUser: banUserModal,
            };
            const key = Object.keys(modalMap).find((k) =>
                setting.classList.contains(k),
            );
            if (key) return openModal(modalMap[key]);
        }
    });

    // 별명 변경 모달 이벤트
    const saveBtn = changeAliasModal.querySelector(".Big-Modal-Button.Save");
    const inputWrapper = changeAliasModal.querySelector(".Input-Area");
    const aliasInput = document.getElementById("user-alias");

    const tempBorder = inputWrapper.style.border;
    aliasInput.addEventListener("focus", (e) => {
        inputWrapper.style.border = "1px solid #1e9cf1";
    });
    aliasInput.addEventListener("blur", (e) => {
        inputWrapper.style.border = tempBorder;
    });
    aliasInput.addEventListener("keyup", (e) => {
        if (aliasInput.value !== "") {
            saveBtn.disabled = false;
            saveBtn.classList.remove("disabled");
        } else {
            saveBtn.disabled = true;
            saveBtn.classList.add("disabled");
        }
    });
    saveBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        alert("추후 수정 예정");
        // 별명 변경 요청 로직 작성
    });

    // 사라진 메세지 모달 이벤트
    const setRemoveTimes = removedMsgModal.querySelectorAll(".Set-Remove-Time");
    const removeAll = removedMsgModal.querySelector(".Remove-All-Button");
    setRemoveTimes.forEach((setTime) => {
        setTime.addEventListener("click", (e) => {
            setRemoveTimes.forEach((btn) =>
                btn.querySelector("svg").classList.add("off"),
            );
            setTime.querySelector("svg").classList.remove("off");
            const selectedTime =
                setTime.querySelector(".Area-Content-Text").textContent;
            userInfoModal.querySelector(
                ".Modal-Bottom-Setting.RemovedMsg .Setting-Arrow",
            ).textContent = selectedTime;
        });
    });
    removeAll.addEventListener("click", (e) => {
        openModal(removeAllMsgModal);
    });

    // 스크린샷 차단하기 모달 이벤트
    const toggleBtn = banScreanShotModal.querySelector(".Toggle-Button");
    const toggleSpan = banScreanShotModal.querySelector(".Toggle-Switch");
    toggleBtn.addEventListener("click", () => {
        toggleBtn.classList.toggle("clicked");
        toggleSpan.classList.toggle("moved");
        const isActive = toggleBtn.classList.contains("clicked");
        userInfoModal.querySelector(
            ".Modal-Bottom-Setting.BanScreanShot .Setting-Arrow",
        ).textContent = isActive ? "켜기" : "끄기";
    });

    saveBtn.addEventListener("click", (e) => {
        if (saveBtn.disabled) return;
        // 저장 로직
    });

    // 작은 모달 클릭 이벤트 ----------------------------
    const deleteChatBtn = deleteChatModal.querySelector(".Small-Button.Ban");
    deleteChatBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        alert("추후 추가 예정");
    });

    const leaveChatBtn = leaveModal.querySelector(".Small-Button.Ban");
    leaveChatBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        alert("추후 추가 예정");
    });

    const removeAllMsgBtn =
        removeAllMsgModal.querySelector(".Small-Button.Ban");
    removeAllMsgBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        alert("추후 추가 예정");
    });

    const banChatBtn = banUserModal.querySelector(".Small-Button.Ban");
    banChatBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        alert("추후 추가 예정");
    });

    // 모달 여닫기 이벤트 -----------------------------------
    function openModal(modal) {
        modalBackDrop.classList.remove("off");
        modal.classList.remove("off");
        if (
            modal.classList.contains("Big-Modal") ||
            modal.classList.contains("Small-Modal")
        ) {
            requestAnimationFrame(() => modal.classList.add("on"));
        }
        if (modal.classList.contains("Small-Modal")) {
            modalBackDrop.style.zIndex = "53";
        }
    }

    function closeModal(modal) {
        if (modal.classList.contains("Big-Modal")) {
            modal.classList.remove("on");
            modal.addEventListener(
                "transitionend",
                () => {
                    modal.classList.add("off");
                    const anyOpen = document.querySelectorAll(
                        ".Big-Modal.on, .Small-Modal.on",
                    );
                    if (anyOpen.length === 0) {
                        modalBackDrop.classList.add("off");
                    }
                },
                { once: true },
            );
        } else if (modal.classList.contains("Small-Modal")) {
            modal.classList.remove("on");
            modal.classList.add("off");
            modalBackDrop.style.zIndex = "";
            const anyOpen = document.querySelectorAll(".Big-Modal.on");
            if (anyOpen.length === 0) {
                modalBackDrop.classList.add("off");
            }
        } else {
            modalBackDrop.classList.add("off");
            modal.classList.add("off");
        }
    }

    modalBackDrop.addEventListener("click", () => {
        const modals = document.querySelectorAll(
            ".Big-Modal, .Small-Modal, .Search-Modal",
        );
        modals.forEach((modal) => {
            modal.classList.remove("on");
            modal.classList.add("off");
        });
        modalBackDrop.style.zIndex = "";
        modalBackDrop.classList.add("off");
    });

    const backBtns = document.querySelectorAll(".Big-Modal-Button.Close");
    backBtns.forEach((back) => {
        const currentModal = back.closest(".Big-Modal");
        back.addEventListener("click", (e) => closeModal(currentModal));
    });

    const closeBtns = document.querySelectorAll(".Close-Button, .Cancel");
    closeBtns.forEach((closeBtn) => {
        const currentModal = closeBtn.closest(".Small-Modal");
        closeBtn.addEventListener("click", (e) => closeModal(currentModal));
    });

    function addReaction(emoji, targetChat) {
        if (!targetChat) return;

        const reactionsDiv = targetChat.querySelector(".Message-Reactions");
        if (!reactionsDiv) return;

        // 현재 내가 선택한 반응 찾기
        const myCurrentReaction = reactionsDiv.querySelector(
            ".Reaction-Badge.my-reaction",
        );

        // 같은 이모지를 다시 클릭한 경우 → 취소
        if (myCurrentReaction && myCurrentReaction.dataset.emoji === emoji) {
            const countEl = myCurrentReaction.querySelector(".Reaction-Count");
            const count = parseInt(countEl.textContent) - 1;
            if (count <= 0) {
                myCurrentReaction.remove();
            } else {
                countEl.textContent = count;
                myCurrentReaction.classList.remove("my-reaction");
            }
            if (reactionsDiv.children.length === 0) {
                targetChat.classList.remove("has-reaction");
            }
            return;
        }

        // 기존에 다른 반응이 있으면 취소
        if (myCurrentReaction) {
            const countEl = myCurrentReaction.querySelector(".Reaction-Count");
            const count = parseInt(countEl.textContent) - 1;
            if (count <= 0) {
                myCurrentReaction.remove();
            } else {
                countEl.textContent = count;
                myCurrentReaction.classList.remove("my-reaction");
            }
        }

        // 새 이모지 추가 or 기존 이모지 카운트 증가
        const existing = [
            ...reactionsDiv.querySelectorAll(".Reaction-Badge"),
        ].find((badge) => badge.dataset.emoji === emoji);

        if (existing) {
            const countEl = existing.querySelector(".Reaction-Count");
            countEl.textContent = parseInt(countEl.textContent) + 1;
            existing.classList.add("my-reaction");
        } else {
            const badge = document.createElement("div");
            badge.classList.add("Reaction-Badge", "my-reaction");
            badge.dataset.emoji = emoji;
            badge.innerHTML = `<span>${emoji}</span><span class="Reaction-Count">1</span>`;

            badge.addEventListener("click", () => {
                addReaction(emoji, targetChat);
            });

            reactionsDiv.appendChild(badge);
        }

        if (reactionsDiv.children.length > 0) {
            targetChat.classList.add("has-reaction");
        } else {
            targetChat.classList.remove("has-reaction");
        }
    }
};
