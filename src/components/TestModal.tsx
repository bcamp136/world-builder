import { Modal, Text, Button } from '@mantine/core'

interface TestModalProps {
  opened: boolean
  onClose: () => void
}

export function TestModal({ opened, onClose }: TestModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Test Modal"
      centered
      size="sm"
    >
      <Text>This is a test modal to check if modals work!</Text>
      <Button onClick={onClose} mt="md">Close</Button>
    </Modal>
  )
}
