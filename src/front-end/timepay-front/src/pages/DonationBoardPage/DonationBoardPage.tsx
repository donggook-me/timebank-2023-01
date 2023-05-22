import { Button, InputNumber, message, Modal, Progress, Spin } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import {
  useGetDonationBoardWithId,
  usePostDonateTimepay,
} from '../../api/hooks/donation';
import { useGetUserInfo } from '../../api/hooks/user';
import PostTypeTag from '../../components/PostTypeTag';
import { headerTitleState } from '../../states/uiState';
import { PATH } from '../../utils/paths';
import { cssDonationBoardPageStyle } from './DonationBoardPage.style';

const DonationBoardPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const { data, isLoading } = useGetDonationBoardWithId(
    parseInt(boardId || '-1'),
  );
  const { data: userInfo, isLoading: isLoadingUserInfo } = useGetUserInfo();
  const usePostDonateTimepayMutation = usePostDonateTimepay();

  const setHeaderTitle = useSetRecoilState(headerTitleState);

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    setHeaderTitle('기부하기');
  });

  const [isOpen, setIsOpen] = useState(false);
  const [donateAmount, setDonateAmount] = useState(10);

  const handleOnCancelOpen = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOnClickDonate = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleOnDonate = useCallback(() => {
    if (boardId && donateAmount)
      Modal.confirm({
        content: '이 금액으로 기부를 진행할까요?',
        okText: '확인',
        cancelText: '취소',
        onOk: async () => {
          usePostDonateTimepayMutation.mutateAsync(
            {
              boardId: parseInt(boardId),
              donateTimePay: donateAmount,
            },
            {
              onSuccess: () => {
                messageApi.open({
                  type: 'success',
                  content: '기부가 완료되었습니다.',
                  duration: 1,
                  onClose: () => {
                    queryClient.invalidateQueries('useGetDonationBoards');
                    queryClient.invalidateQueries('useGetDonationBoardWithId');
                    handleOnCancelOpen();
                  },
                });
              },
            },
          );
        },
      });
  }, [
    messageApi,
    queryClient,
    handleOnCancelOpen,
    boardId,
    donateAmount,
    usePostDonateTimepayMutation,
  ]);

  const isMyBoard = useMemo(() => {
    return (
      !isLoading &&
      !isLoadingUserInfo &&
      data?.data.userId === userInfo?.data.body.uid
    );
  }, [isLoading, isLoadingUserInfo, data, userInfo]);

  const footer = useMemo(() => {
    return (
      <>
        <Button onClick={handleOnCancelOpen}>취소</Button>
        <Button type="primary" onClick={handleOnDonate}>
          확인
        </Button>
      </>
    );
  }, [handleOnCancelOpen, handleOnDonate]);

  return (
    <div css={cssDonationBoardPageStyle}>
      {isLoading ? (
        <Spin />
      ) : (
        <>
          {contextHolder}
          <div className="donation-board-container">
            <div className="board-header">
              <div className="default">
                <PostTypeTag type={data?.data?.type} />
                <Progress
                  style={{ width: 150 }}
                  percent={
                    data?.data.donateTimePay !== undefined &&
                    data.data.targetTimePay !== undefined
                      ? (data?.data.donateTimePay / data?.data.targetTimePay) *
                        100
                      : 0
                  }
                  size="small"
                />
              </div>

              {isMyBoard && (
                <div className="mine">
                  <Button
                    type="primary"
                    onClick={() => {
                      navigate(`${PATH.DONATION_BOARD_WRITE}/${boardId}`);
                    }}
                  >
                    수정
                  </Button>
                  <Button type="default">삭제</Button>
                </div>
              )}
            </div>
            <div className="title-container">{data?.data.title}</div>
            <div className="donation-info-container">
              <div className="target-time-pay">
                목표 : {data?.data.targetTimePay} TP
              </div>
              <div className="donateTimePay-time-pay">
                현재 : {data?.data.donateTimePay} TP
              </div>
            </div>
            <div className="organization-info-container">
              <img
                alt="기관"
                src={
                  data?.data.imageURL ||
                  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                }
              />
              <div className="name">{data?.data.organizationName || '-'}</div>
            </div>
            <div className="content-container">{data?.data.content}</div>
            {!isMyBoard && (
              <Button type="primary" onClick={handleOnClickDonate}>
                기부하기
              </Button>
            )}
          </div>
          <Modal
            open={isOpen}
            onCancel={handleOnCancelOpen}
            title="기부하기"
            footer={footer}
            className="donate-modal"
          >
            <div className="">
              기관 이름에게 얼마를 기부할까요?
              <div className="guide">
                기부하는 즉시 타임페이가 소모되니 주의해주세요.
              </div>
              <InputNumber
                value={donateAmount}
                onChange={(value) => setDonateAmount(value || 0)}
                step={10}
                addonAfter="TP"
              />
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default DonationBoardPage;
